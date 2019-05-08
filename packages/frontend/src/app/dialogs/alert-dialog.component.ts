/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {observeAction, ReactiveChangeDetectionModule} from "../reactivate-change-detection";

@Component({
    selector: 'dk-dialog-alert',
    template: `
        <div mat-dialog-content>
            <h3>{{data.title}}</h3>
            <p *ngIf="data.message" style="white-space: pre-line; user-select: text">{{data.message}}</p>
        </div>
        <div class="actions">
            <button (click)="onOkClick()" cdkFocusInitial>Ok</button>
        </div>
    `,
})
export class AlertDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        ReactiveChangeDetectionModule.tick();
    }

    @observeAction()
    onCancelClick(): void {
        this.dialogRef.close(false);
    }

    @observeAction()
    onOkClick(): void {
        this.dialogRef.close(true);
        ReactiveChangeDetectionModule.tick();
    }
}
