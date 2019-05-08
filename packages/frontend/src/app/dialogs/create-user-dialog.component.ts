/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {AfterViewInit, ChangeDetectorRef, Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {observeAction, reactiveComponent} from "../reactivate-change-detection";
import {ControllerClient} from "../providers/controller-client";
import {RoleType, User} from "@glut/admin-core";

@reactiveComponent()
@Component({
    template: `
        <form #form="ngForm" (submit)="send()">
            <div mat-dialog-content>
                <h3>Create User</h3>

                <input type="text" name="username" placeholder="Username"
                       [required]="true" [(ngModel)]="user.username" />
                
                <input type="text" name="email" placeholder="Email"
                       [required]="true" [(ngModel)]="user.email" />
                
                <input type="password" name="password" placeholder="Password"
                       [required]="true" [(ngModel)]="user.password" />
                
                <select [(ngModel)]="user.role" name="role">
                    <option [value]="RoleType.regular">Regular</option>
                    <option [value]="RoleType.admin">Admin</option>
                </select>
            </div>
            <div *ngIf="error">
                {{error}}
            </div>
            
            <div class="actions">
                <button type="button" (click)="onCancelClick()">Abort</button>
                <button type="submit" [disabled]="form.invalid || creating">Create</button>
            </div>
        </form>
    `,
})
export class CreateUserDialogComponent implements AfterViewInit {
    public creating = false;
    public RoleType = RoleType;
    public user: User;
    public error: any;

    constructor(
        public dialogRef: MatDialogRef<CreateUserDialogComponent>,
        protected cd: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: {user: User | undefined},
        private controllerClient: ControllerClient,
    ) {
        this.user = this.data.user || new User('', '', RoleType.regular, '');
    }

    ngAfterViewInit(): void {
    }

    onCancelClick(): void {
        this.dialogRef.close(false);
    }

    @observeAction()
    async send() {
        this.error = undefined;
        this.creating = true;
        this.cd.detectChanges();

        try {
            await this.controllerClient.app().createUser(this.user);
        } catch (error) {
            this.error = error;
        } finally {
            this.creating = false;
            this.cd.detectChanges();
            if (!this.error) {
                this.dialogRef.close(true);
            }
        }
    }
}
