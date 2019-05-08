/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {observeAction} from "../reactivate-change-detection";

@Component({
    selector: 'dk-dialog-prompt',
    template: `
        <form #form="ngForm" (submit)="onSubmit()">
            <div mat-dialog-content>
                <h3>{{data.title}}</h3>
                <input type="text" name="value"  required [(ngModel)]="data.value" />
            </div>
            <div class="actions">
                <button type="button" (click)="onCancelClick()">Abort</button>
                <button type="submit" [disabled]="form.invalid">OK</button>
            </div>
        </form>
    `,
})
export class PromptDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    @observeAction()
    onCancelClick(): void {
        this.dialogRef.close();
    }

    @observeAction()
    onSubmit(): void {
        this.dialogRef.close(this.data.value);
    }
}
