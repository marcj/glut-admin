/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {Component, Inject, OnDestroy} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {BehaviorSubject, Subject} from "rxjs";
import {observe} from "../reactivate-change-detection";

class State {
    title: string = '';
    step: number = 0;
    steps: number = 1;
}

export class ProgressDialogState extends BehaviorSubject<State> {
    protected readonly state = new State;

    public readonly closer = new BehaviorSubject<boolean>(false);

    constructor() {
        super(undefined!);
        this.next(this.state);
    }

    public cancel() {
        this.closer.next(true);
    }

    public close() {
        this.closer.next(true);
    }

    public async waitForClose(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.closer.subscribe((next) => {
                if (next) {
                    resolve(next);
                }
            });
        });
    }

    set title(v: string) {
        this.state.title = v;
        this.next(this.state);
    }

    get title(): string {
        return this.state.title;
    }

    set step(v: number) {
        this.state.step = v;
        this.next(this.state);
    }

    get step(): number {
        return this.state.step;
    }

    set steps(v: number) {
        this.state.steps = v;
        this.next(this.state);
    }

    get steps(): number {
        return this.state.steps;
    }
}

@Component({
    template: `
        <div mat-dialog-content *ngIf="state$|async as state">
            <h3>{{state.title}}</h3>
            <div>
                <div style="text-align: right; padding: 2px 0;">
                    {{state.step}} / {{state.steps}}
                </div>
                <mat-progress-bar mode="determinate" [value]="state.step/state.steps * 100"></mat-progress-bar>
            </div>
        </div>
        <div class="actions" *ngIf="data.cancelable">
            <button mat-button (click)="onCancelClick()">Cancel</button>
        </div>
    `,
})
export class ProgressDialogComponent implements OnDestroy {
    @observe()
    public readonly state$: ProgressDialogState;

    constructor(
        public dialogRef: MatDialogRef<ProgressDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            state: ProgressDialogState,
            cancelable: boolean,
        }) {
        this.state$ = data.state;
        data.state.closer.subscribe((v) => {
            if (v) {
                this.dialogRef.close(v);
            }
        });
    }

    ngOnDestroy(): void {
    }

    onCancelClick() {
        this.state$.closer.next(true);
        this.dialogRef.close(false);
    }
}
