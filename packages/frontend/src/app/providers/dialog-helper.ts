/*
 * Copyright (c) by Marc J. Schmidt <marc@marcjschmidt> - all rights reserved.
 */

import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {PromptDialogComponent} from "../dialogs/prompt-dialog.component";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog.component";
import {AlertDialogComponent} from "../dialogs/alert-dialog.component";
import {ClassType} from "@marcj/estdlib";
import {ProgressDialogComponent, ProgressDialogState} from "../dialogs/progress-dialog.component";

@Injectable()
export class DialogHelper {

    constructor(private dialog: MatDialog) {
    }

    public prompt(title: string, defaultValue: string = ''): MatDialogRef<PromptDialogComponent, string> {
        return this.dialog.open(PromptDialogComponent, {
            width: '250px',
            data: {title: title, value: defaultValue}
        });
    }

    public dangerConfirm(title: string, confirmCallback?: () => Promise<any>): MatDialogRef<ConfirmDialogComponent, string> {
        return this.confirm(title, confirmCallback, true);
    }

    public confirm(title: string, confirmCallback?: () => Promise<any>, danger = false): MatDialogRef<ConfirmDialogComponent, string> {
        if (confirmCallback) {
            const instance = this.dialog.open(ConfirmDialogComponent, {
                width: '250px',
                data: {
                    title: title,
                    danger: danger,
                    okCallback: async () => {
                        try {
                            await confirmCallback();
                            instance.close(true);
                        } catch (error) {
                            this.error(error);
                            instance.close(false);
                        }
                    }
                }
            });

            return instance;
        }

        const instance = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: {
                title: title,
                danger: danger,
                okCallback: async () => {
                    instance.close(true);
                }
            }
        });

        return instance;
    }

    public progress(cancelable: boolean = true): ProgressDialogState {
        const state = new ProgressDialogState;
        const dialog = this.dialog.open(ProgressDialogComponent, {
            width: '250px',
            disableClose: true,
            data: {cancelable: cancelable, state: state}
        });

        return state;
    }

    public alert(title: string, message?: string): MatDialogRef<AlertDialogComponent, string> {
        return this.dialog.open(AlertDialogComponent, {
            width: '250px',
            data: {title: title, message: message}
        });
    }

    public open<T>(classType: ClassType<T>, data: any = {}): MatDialogRef<T, string> {
        return this.dialog.open(classType, {
            width: '250px',
            data: data
        });
    }

    public error(error: Error) {
        this.alert('Error', error.message);
    }
}
