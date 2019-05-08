 import {ChangeDetectorRef, Component} from "@angular/core";
import {EntitySubject, ItemObserver, observeItem} from "@marcj/glut-core";
import {FrontendUser, RoleType} from "@glut/admin-core";
import {ActivatedRoute, Router} from "@angular/router";
import {ControllerClient} from "../../providers/controller-client";
import {DialogHelper} from "../../providers/dialog-helper";
import {findRouteParameter} from "../../utils";
import {observe} from "../../reactivate-change-detection";
import {Breadcrumbs} from "../../providers/breadcrumbs";

@Component({
    template: `
        <div class="main-container" *ngIf="user$|async as user">
            <div class="header-banner">
                <div class="header-left">

                    <div style=" float: left; width: 70px; height: 70px; border: 1px solid silver; text-align: center; margin-right: 15px;">
                        <img
                            *ngIf="user.image"
                            style="max-width: 70px; max-height: 70px;"
                            [src]="user.image|dataUri"/>
                    </div>
                    <div class="title">{{user.username}}</div>
                </div>

                <div class="header-columns">
                    <div>
                        <label>Email</label>
                        {{user.email}}
                    </div>
                    <div>
                        <label>Role</label>
                        {{RoleType[user.role]}}
                    </div>
                    <div>
                        <label>Registered</label>
                        {{user.created | date:'short'}}
                    </div>
                    <div>
                        <label>Updated</label>
                        {{user.updated | date:'short'}}
                    </div>
                </div>
            </div>
            
            <div class="tabs topless">
                <button
                    [class.active]="route|activeRoute:3:'settings'"
                    [routerLink]="['/admin', 'user', userId, 'settings']">Settings</button>
            </div>

            <router-outlet></router-outlet>
        </div>
    `,
})
export class UserComponent {
    @observe({unsubscribe: true})
    public user$?: EntitySubject<FrontendUser>;

    public userId?: string;
    public RoleType = RoleType;

    protected watcher?: ItemObserver<FrontendUser>;

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public controllerClient: ControllerClient,
        protected dialogHelper: DialogHelper,
        protected cd: ChangeDetectorRef,
        protected breadcrumbs: Breadcrumbs,
    ) {
        this.breadcrumbs.addBreadCrumbTitleAtPosition(UserComponent, 0, 'User', ['../']);
        route.params.subscribe(async () => {
            if (this.user$) {
                await this.user$.unsubscribe();
            }

            this.userId = findRouteParameter(route, 'userId');
            this.user$ = await controllerClient.app().getUser(this.userId);
            this.breadcrumbs.addBreadCrumbTitleAtPosition(UserComponent, 1, this.user$.value.username);

            this.watcher = observeItem(this.user$);

            this.cd.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.breadcrumbs.deleteBreadCrumbs(UserComponent);
    }
}
