import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {DialogHelper} from "../../providers/dialog-helper";
import {FrontendUser, RoleType, User} from "@glut/admin-core";
import {Collection} from "@marcj/glut-core";
import {observe} from "../../reactivate-change-detection";
import {ControllerClient} from "../../providers/controller-client";
import {CreateUserDialogComponent} from "../../dialogs/create-user-dialog.component";
import {Router} from "@angular/router";

@Component({
    template: `
        <div class="actions topless">
            <button class="icon primary first" (click)="openCreate()">
                <dk-icon name="add"></dk-icon>
            </button>
            
            <div class="right">
                <input type="text" class="search" placeholder="Search" [(ngModel)]="searchTerm"/>
            </div>
        </div>

        <div class="inset-h">
            <simple-table 
                [items]="users" 
                defaultSort="username" 
                [selectable]="true"
                [filterQuery]="searchTerm" 
                [filterFields]="['username']"
                (dbclick)="open($event)"
            >
                <simple-table-column name="username" header="Username"></simple-table-column>
                <simple-table-column name="email" header="Email"></simple-table-column>
                
                <simple-table-column name="role" header="Role">
                    <ng-container *simpleTableCell="let row">
                        {{RoleType[row.role]}}
                    </ng-container>
                </simple-table-column>
                
                <simple-table-column name="created" header="Created">
                    <ng-container *simpleTableCell="let row">
                        {{row.created | date:'short'}}
                    </ng-container>
                </simple-table-column>
                
                <simple-table-column name="updated" header="Updated">
                    <ng-container *simpleTableCell="let row">
                        {{row.updated | date:'short'}}
                    </ng-container>
                </simple-table-column>
            </simple-table>
        </div>
    `
})
export class UserListComponent implements OnDestroy, OnInit {
    public searchTerm: string = '';

    public RoleType = RoleType;

    @observe({unsubscribe: true})
    public users?: Collection<FrontendUser>;

    constructor(
        protected router: Router,
        public controllerClient: ControllerClient,
        protected dialogHelper: DialogHelper,
        protected cd: ChangeDetectorRef,
    ) {
    }

    async ngOnInit() {
        this.users = await this.controllerClient.app().getUsers();
        this.cd.detectChanges();
    }

    ngOnDestroy(): void {
    }

    async open(item: FrontendUser) {
        this.router.navigate(['/admin/user', item.id]);
    }

    async openCreate() {
        const user = new User('', '', RoleType.regular, '');
        await this.dialogHelper.open(CreateUserDialogComponent, {user: user}).afterClosed().toPromise();
    }
}
