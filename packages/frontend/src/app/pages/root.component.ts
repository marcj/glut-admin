import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {unsubscribe} from "../reactivate-change-detection";
import {Subscriptions} from "@marcj/estdlib-rxjs";
import {ControllerClient} from "../providers/controller-client";

@Component({
    template: `
        <div class="position-full"
        >
            <div class="left-small dark" *ngIf="!controllerClient.isLoggedIn()">
                <div class="logo">
                    <img routerLink="/" src="assets/images/logo-white.png"/>
                </div>

                <div class="menu">
                    <button (click)="login()">Login</button>
                </div>
            </div>

            <div class="left dark" *ngIf="controllerClient.isLoggedIn()">
                <div style="text-align: center; padding-bottom: 15px;">
                    <img routerLink="/" src="assets/images/logo-white.png"/>
                </div>

                <h3 style="text-align: right; border-bottom: 0;">
                    <div *ngIf="controllerClient.getUser()|async as user"
                    >
                        <ng-container *ngIf="!controllerClient.isOrganisationLoaded()">
                            {{user.username}}
                        </ng-container>

                        <dk-icon style="width: unset;"
                                 name="keyboard_arrow_down"></dk-icon>
                    </div>
                </h3>

                <dk-menu #userMenu="dkMenu">
                    <a (click)="logout()">Logout</a>
                </dk-menu>

                <a
                    [class.selected]="route|activeRoute:0:'admin'"
                    [routerLink]="['/admin']">Administration</a>

                <a
                    [class.selected]="route|activeRoute:0:'files'"
                    [routerLink]="['/files']">Files</a>
                
                <a
                    [class.selected]="route|activeRoute:0:'pages'"
                    [routerLink]="['/pages']">Pages</a>
                
                <a
                    [class.selected]="route|activeRoute:0:'posts'"
                    [routerLink]="['/posts']">Posts</a>
                
                <a
                    [class.selected]="route|activeRoute:0:'events'"
                    [routerLink]="['/events']">Events</a>
            </div>


            <div class="main"
                 [class.with-sidebar-small]="!controllerClient.isLoggedIn()"
                 [class.with-sidebar]="controllerClient.isLoggedIn()"
            >
                <dk-breakcrump></dk-breakcrump>

                <router-outlet class="animated"></router-outlet>
            </div>
        </div>

        <div class="position-full" style="background-color: rgba(51,51,51,0.74);" *ngIf="!(controllerClient.connected|async)">
            Connection lost :(
        </div>
    `,
    styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnDestroy, OnInit {
    @unsubscribe()
    protected subs = new Subscriptions();

    constructor(
        public router: Router,
        public controllerClient: ControllerClient,
        public route: ActivatedRoute,
    ) {
    }

    async ngOnInit() {
        //at this point, we are always logged out, since this is the bootstrap component
        //CanActivate triggers the userLoaded if token is found.

        //is triggered when user logged in or user switched account to different organisation or to user account.
       this.subs.add = this.controllerClient.userLoaded.subscribe(async (user) => {
            //await this.loadUser(user);
        });
    }

    public login() {
        this.router.navigate(['login'], {queryParams: {redirect: this.router.routerState.snapshot.url}});
    }

    public logout() {
        this.controllerClient.logout();
    }

    ngOnDestroy(): void {
    }
}
