import "source-map-support/register";
import 'reflect-metadata';
import * as path from "path";
import {FrontendUser, hasRole, RoleType, User, models} from "@glut/admin-core";
import {Application, ApplicationModule, ApplicationServer, Session} from "@marcj/glut-server";
import {ClassType, sleep} from "@marcj/estdlib";
import {createConnection} from 'typeorm';
import {Database} from '@marcj/marshal-mongo';
import {AppController} from "./controller/app.controller";
import {Injector} from "injection-js";
import {createServer as createHttpServer} from 'http';
import * as express from 'express';
import {getRole} from "./utils";
import * as commander from 'commander';
import {hash} from "bcryptjs";
import * as compression from "compression";
import {SessionHelper, UserSession} from "./session";
import {PermissionManager} from "./manager/permission";

// const Promise = require('bluebird');
// Promise.longStackTraces(); //needs to be disabled in production since it leaks memory
// global.Promise = Promise;

// only necessary when no ts-node is used
// require('source-map-support').install({hookRequire: true});

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error);
    process.exit(1);
});

commander
    .option('--server-mode', 'Activates server-mode')
    .option('--mongo <path>', 'Path to mongod')
    .option('--redis <path>', 'Path to redis-server')
    .option('--mongo-host <host>', 'Host of mongo to use')
    .option('--redis-host <host>', 'Host of redis to use')
    .parse(process.argv);

const serverMode = commander.serverMode || false;
console.log('serverMode', serverMode);

const mongoConfig = {
    start: false,
    binary: '',
    host: commander.mongoHost || '127.0.0.1',
    port: 27017
};

const redisConfig = {
    start: false,
    binary: '',
    host: commander.redisHost || '127.0.0.1',
    port: 6379
};

const app = express();
const frontendPath = path.resolve('../frontend/dist/glut-admin');

app.disable('x-powered-by');
app.disable('etag');
app.use(compression());
app.use(express.static(frontendPath));
app.all('/*', function (req, res) {
    res.sendFile('index.html', {root: frontendPath});
});


// const selfsigned: any = require('selfsigned');
// const attrs = [{name: 'commonName', value: 'localhost'}];
// const pems = selfsigned.generate(attrs, {days: 365});
// const https = createHttpsServer({
//     cert: pems.cert,
//     key: pems.private,
// }, app);

const http = createHttpServer(app);

@ApplicationModule({
    controllers: [
        AppController,
    ],
    connectionProviders: [
        SessionHelper,
    ],
    serverProviders: [
        PermissionManager,
        //{provide: FileType, deps: [], useFactory: () => FileType.forCustomType(GlutAdminFile)},
    ],
    notifyEntities: [
        FrontendUser,
    ],
    entitiesForTypeOrm: [
        User,
    ],
    config: {
        workers: 1,
        mongoHost: mongoConfig.host,
        mongoPort: mongoConfig.port,
        mongoDbName: 'glut-admin',
        server: http,
        redisHost: redisConfig.host,
        redisPort: redisConfig.port,
        redisPrefix: 'glutadmin',
        fsPath: '~/.glut-admin/server-files',
    }
})
class MyApp extends Application {
    //necessary to register Marshal models
    models = models;

    constructor(
        protected database: Database,
        protected permissionManager: PermissionManager,
    ) {
        super();
    }

    async bootstrap(): Promise<any> {
        const admin = await this.database.get(User, {username: 'admin'});
        if (!admin) {
            const password = 'admin';
            const user = new User('admin', 'admin@localhost', RoleType.admin, await hash(password, 10));
            await this.database.add(User, user);
            console.log('###### Added admin user');
        }

        console.log('Worker bootstrapped');
    }

    public async hasAccess<T>(injector: Injector, session: Session | undefined, controller: ClassType<T>, action: string): Promise<boolean> {
        const requiredControllerRole = getRole(controller, action);
        let currentRole = RoleType.anonymouse;

        if (session instanceof UserSession) {
            currentRole = session.role;
        }

        //todo, read role from Session object
        console.log('hasAccess', action, currentRole, requiredControllerRole, hasRole(currentRole, requiredControllerRole));
        return hasRole(currentRole, requiredControllerRole);
    }

    async authenticate(injector: Injector, token: { id: 'user' | 'job' | 'node', token: any }): Promise<any> {
        if (token.id === 'user') {
            const userToken = token as {
                id: 'user',
                token: string,
                //accountId: string,
            };

            const user = await this.permissionManager.getUserForToken(userToken.token);

            if (!user) {
                throw new Error('Invalid user token.');
            }

            //check for accountId. Is used to interact as organisation
            /*if (userToken.accountId && userToken.accountId !== user.id) {
                if (this.permissionManager.isOrganisationMember(user.id, userToken.accountId)) {
                    return new UserSession(user.id, userToken.accountId, true, user.username, user.role);
                }

                throw new Error('Access denied to organisation.');
            }*/

            return new UserSession(user.id, user.id, user.username, user.role);
        }

        return super.authenticate(injector, token);
    }
}

const glutApp = ApplicationServer.createForModule(MyApp);

(async () => {
    console.log('wait for mongo boot up');

    while (true) {
        try {
            await createConnection({
                type: "mongodb",
                host: mongoConfig.host,
                port: mongoConfig.port,
                database: 'glut-admin',
                name: 'connectionTest',
                useNewUrlParser: true,
            });
            break;
        } catch (e) {
            await sleep(0.5);
        }
    }

    console.log('mongo up');

    // https.listen(8961, () => console.log('Listening on https://localhost:8961'));
    const port = process.env.PORT || 8080;

    http.listen(port, () => console.log('Listening on http://localhost:' + port));
    await glutApp.start();
})();
