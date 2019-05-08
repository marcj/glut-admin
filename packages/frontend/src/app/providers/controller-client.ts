import {AppControllerInterface, FrontendUser} from "@glut/admin-core";
import {SocketClient} from "@marcj/glut-client";
import {EntitySubject} from "@marcj/glut-core";
import {BehaviorSubject, Subject} from "rxjs";
import {Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {ReactiveChangeDetectionModule} from "../reactivate-change-detection";
import {Subscriptions} from "@marcj/estdlib-rxjs";

@Injectable()
export class ControllerClient {
    protected client?: SocketClient;
    protected user?: EntitySubject<FrontendUser>;
    public isBrowser: boolean = true;
    public accountId: string = '';

    public readonly connected = new BehaviorSubject<boolean>(false);
    public readonly userLoaded = new Subject<FrontendUser | undefined>();
    public readonly clientSubject = new BehaviorSubject<SocketClient | undefined>(undefined);

    protected connectedSubs = new Subscriptions;

    protected lastTryReconnectTimer: any;

    protected token?: string;

    constructor(private router: Router) {}

    public clearClient() {
        if (this.client) {
            this.client.disconnect();
        }

        if (this.connectedSubs) {
            this.connectedSubs.unsubscribe();
        }

        this.client = undefined;
        this.clientSubject.next(this.client);

        if (this.user) {
            this.user.unsubscribe();
        }
        this.user = undefined;
    }

    public hasToken(): boolean {
        return Boolean(this.token);
    }

    public async logout() {
        //disconnect
        this.clearClient();
        sessionStorage.removeItem('glutAccessToken');
        this.userLoaded.next(undefined);

        const url = '/'; //this.router.routerState.snapshot.url;
        await this.router.navigateByUrl('/redirect', {skipLocationChange: true});
        await this.router.navigateByUrl(url);
    }

    public async chooseAccount(accountId: string = '') {
        this.accountId = accountId;
        sessionStorage.setItem('glutAccountId', this.accountId);
        this.clearClient();

        this.userLoaded.next(undefined);

        const url = '/'; //this.router.routerState.snapshot.url;
        await this.router.navigateByUrl('/redirect', {skipLocationChange: true});
        await this.router.navigateByUrl(url);
    }

    public isOrganisationLoaded(): boolean {
        return this.accountId !== '';
    }

    public isLoggedIn(): boolean {
        return this.user !== undefined;
    }

    public async loadUser() {
        this.user = await this.app().getCurrentUser();
        this.userLoaded.next(this.user.value);
    }

    public getUser(): EntitySubject<FrontendUser> {
        if (!this.user) {
            throw new Error(`Not logged in`);
        }

        return this.user;
    }

    public getClient(): SocketClient {
        if (!this.client) {
            this.token = sessionStorage.getItem('glutAccessToken') || undefined;
            const ssl = location.protocol.startsWith('https');

            this.client = new SocketClient({
                host: location.hostname,
                ssl: ssl,
                port: Number(location.port) || (ssl ? 443 : 80),
                token: this.token ? {
                    id: 'user',
                    token: this.token,
                } : undefined
            });

            this.clientSubject.next(this.client);

            if (this.connectedSubs) {
                this.connectedSubs.unsubscribe();
            }

            this.connectedSubs.add = this.client.reconnected.subscribe(async () => {
                if (this.client && this.client.isLoggedIn()) {
                    await this.loadUser();
                }
                //we went online again, so redirect to reload whole page.
                const url = this.router.routerState.snapshot.url;
                await this.router.navigateByUrl('/redirect', {skipLocationChange: true});
                await this.router.navigateByUrl(url);
            });

            this.connectedSubs.add = this.client.connection.subscribe(async (connected) => {
                this.connected.next(connected);
                ReactiveChangeDetectionModule.tick();

                if (!connected) {
                    //we disconnected, so try to reconnect in a short time
                    this.tryReconnect();
                }
            });
        }

        return this.client;
    }

    public async tryReconnect() {
        if (this.lastTryReconnectTimer) {
            return;
        }

        try {
            await this.getClient().connect();
        } finally {
            if (!this.getClient().isConnected()) {
                //we are still disconnected, so try in 2 seconds again
                this.lastTryReconnectTimer = setTimeout(() => {
                    this.lastTryReconnectTimer = undefined;
                    this.tryReconnect();
                }, 2500);
            }
        }
    }

    public app() {
        return this.getClient().controller<AppControllerInterface>('app');
    }
}
