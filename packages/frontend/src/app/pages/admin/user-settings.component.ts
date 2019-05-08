import {ChangeDetectorRef, Component, OnDestroy} from "@angular/core";
import {DialogHelper} from "../../providers/dialog-helper";
import {FrontendUser} from "@glut/admin-core";
import {observe} from "../../reactivate-change-detection";
import {ActivatedRoute, Router} from "@angular/router";
import {EntitySubject, ItemObserver, observeItem} from "@marcj/glut-core";
import {ControllerClient} from "../../providers/controller-client";
import {Breadcrumbs} from "../../providers/breadcrumbs";
import {findRouteParameter} from "../../utils";

@Component({
    template: `
        <ng-container *ngIf="user$|async as user">
            <div>
                <div class="actions topless">
                    <div class="right">
                        <button class="primary" [disabled]="!watcher.changed()" (click)="save()">
                            Save
                        </button>
                        
                        <button (click)="updatePassword()">
                            Update password
                        </button>
                        
                        <button class="danger last" (click)="remove()">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
    
            <div class="inset-h columns" *ngIf="user">
                <div style="width: 50%;">
                    <div>
                        <div>Image</div>
                        <div>
                            <dk-file [(model)]="user.image" ></dk-file>
                        </div>
                    </div>
                    
                    <div>
                        <div>Username</div>
                        <div>
                            <input type="text" required [(ngModel)]="user.username" />
                        </div>
                    </div>
    
                    <div>
                        <div>Email</div>
                        <div>
                            <input type="text" required [(ngModel)]="user.email" />
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class UserSettingsComponent implements OnDestroy {
    @observe({unsubscribe: true})
    public user$?: EntitySubject<FrontendUser>;

    public userId?: string;

    protected watcher?: ItemObserver<FrontendUser>;

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public controllerClient: ControllerClient,
        protected dialogHelper: DialogHelper,
        protected cd: ChangeDetectorRef,
        protected breadcrumbs: Breadcrumbs,
    ) {

        route.params.subscribe(async () => {
            if (this.user$) {
                await this.user$.unsubscribe();
            }

            this.userId = findRouteParameter(route, 'userId');
            this.user$ = await controllerClient.app().getUser(this.userId);

            (window as any)['user'] = this.user$.value;
            this.watcher = observeItem(this.user$);

            this.cd.detectChanges();
        });
    }

    ngOnDestroy(): void {
    }

    async remove() {
        if (this.userId) {
            const a = await this.dialogHelper.confirm('Delete user?').afterClosed().toPromise();
            if (a) {
                await this.controllerClient.app().removeUser(this.userId);
                this.router.navigate(['/admin/organisation']);
            }
        }
    }

    async updatePassword() {
        if (this.userId) {
            const password = await this.dialogHelper.prompt('New password', '').afterClosed().toPromise();
            if (password) {
                await this.controllerClient.app().updatePassword(this.userId, password);
            }
        }
    }

    async save() {
        if (this.userId && this.watcher && this.watcher.changed()) {
            this.user$!.value.updated = new Date();
            try {
                await this.controllerClient.app().patchUser(this.userId, this.watcher.getPatches());
                this.watcher.reset();
                this.cd.detectChanges();
            } catch (error) {
                console.error(error);
                //todo, show error
            }
        }
    }
}
