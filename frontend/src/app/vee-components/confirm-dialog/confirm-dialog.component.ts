import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

export enum Color {
     Primary = 'primary',
     Accent  = 'accent',
     Warn    = 'warn'
}

export interface ConfirmDialogOptions {
    titleHtml:          string;
    contentHtml:        string;
    okButtonHtml?:      string;
    cancelButtonHtml?:  string;
    okButtonColor?:     Color;
    cancelButtonColor?: Color;
}

export type ConfirmDialogResult = boolean;

@Component({
  selector:    'vee-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls:  ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogOptions
    ) {
        data.okButtonHtml      = data.okButtonHtml      || 'Ok';
        data.cancelButtonHtml  = data.cancelButtonHtml  || 'Cancel';
        data.okButtonColor     = data.okButtonColor     || Color.Warn;
        data.cancelButtonColor = data.cancelButtonColor || Color.Primary;
    }
}
