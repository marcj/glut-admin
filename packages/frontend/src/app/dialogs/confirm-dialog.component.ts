/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {observeAction} from "../reactivate-change-detection";

@Component({
    template: `
        <div mat-dialog-content>
            <h3>{{data.title}}</h3>
        </div>
        <div class="actions">
            <button mat-button (click)="onCancelClick()">Cancel</button>
            <button mat-button (click)="onOkClick()"
                    [class.danger]="data.danger"
                    [disabled]="okaying" cdkFocusInitial>
                <mat-spinner *ngIf="okaying" [diameter]="15"></mat-spinner>
                Ok
            </button>
        </div>
    `,
})
export class ConfirmDialogComponent {
    public okaying = false;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string,
            danger: boolean,
            okCallback: () => Promise<any>,
        }) {
    }

    @observeAction()
    onCancelClick() {
        this.dialogRef.close(false);
    }

    @observeAction()
    async onOkClick() {
        this.okaying = true;
        try {
            await this.data.okCallback();
        } finally {
            this.okaying = false;
        }
    }
}
