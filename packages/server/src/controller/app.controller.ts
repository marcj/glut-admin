import {Role} from '../utils';
import {AppControllerInterface, FrontendUser, RoleType, User} from '@glut/admin-core';
import {Subscriptions} from "@marcj/estdlib-rxjs";
import {Action, Controller, EntitySubject, Collection, PartialParamType} from "@marcj/glut-core";
import {Database} from "@marcj/marshal-mongo";
import {SessionHelper} from "../session";
import {compare, hash} from "bcryptjs";
import {Token, TokenRole} from "../model/token";
import {EntityStorage, ExchangeDatabase} from "@marcj/glut-server";

@Controller('app')
export class AppController implements AppControllerInterface {
    private subs = new Subscriptions();

    constructor(
        private sessionHelper: SessionHelper,
        private entityStorage: EntityStorage,
        private database: Database,
        private exchangeDatabase: ExchangeDatabase,
    ) {
    }

    public async destroy() {
        this.subs.unsubscribe();
    }

    private getUserId(): string {
        return this.sessionHelper.getUserSession().chosenAccountId;
    }

    private getAuthenticatedUserId(): string {
        return this.sessionHelper.getUserSession().authenticatedUserId;
    }

    @Action()
    @Role(RoleType.anonymouse)
    async login(username: string, password: string): Promise<string> {
        const user = await this.database.get(User, {
            username: username,
        });

        if (user && user.password) {
            const valid = await compare(password, user.password);
            if (valid) {
                //create new token
                const token = new Token(user.id, TokenRole.USER);
                await this.database.add(Token, token);

                return token.token;
            }
        }

        return '';
    }

    @Action()
    @Role(RoleType.regular)
    async getCurrentUser(): Promise<EntitySubject<FrontendUser>> {
        return this.entityStorage.findOne(FrontendUser, {
            id: this.getAuthenticatedUserId()
        });
    }

    @Action()
    @Role(RoleType.admin)
    async getUser(id: string): Promise<EntitySubject<FrontendUser>> {
        return this.entityStorage.findOne(FrontendUser, {
            id: id
        });
    }

    @Action()
    @Role(RoleType.admin)
    async getUsers(): Promise<Collection<FrontendUser>> {
        return this.entityStorage.collection(FrontendUser).filter({
        }).find();
    }

    @Action()
    @Role(RoleType.admin)
    async createUser(user: User): Promise<void> {
        user.password = await hash(user.password, 10);
        await this.exchangeDatabase.add(User, user, {advertiseAs: FrontendUser});
    }

    @Action()
    @Role(RoleType.admin)
    async createOrganisation(user: User) {
        await this.exchangeDatabase.add(User, user, {advertiseAs: FrontendUser});
    }

    @Action()
    @Role(RoleType.admin)
    async updatePassword(userId: string, password: string): Promise<void> {
        password = await hash(password, 10);
        await this.database.patch(User, {id: userId}, {password: password});
    }

    @Action()
    @Role(RoleType.admin)
    async patchUser(userId: string, @PartialParamType(User) patches: any): Promise<void> {
        await this.exchangeDatabase.patch(User, userId, patches, {advertiseAs: FrontendUser});
    }

    @Action()
    @Role(RoleType.admin)
    async removeUser(userId: string): Promise<void> {
        await this.exchangeDatabase.remove(FrontendUser, userId);
    }
}
