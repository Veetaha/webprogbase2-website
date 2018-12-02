import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

export interface MessageBoxOptions {
    titleHtml:     string;
    contentHtml:   string;
    okButtonHtml?: string;
}

@Component({
  selector:    'vee-message-box',
  templateUrl: './message-box.component.html',
  styleUrls:  ['./message-box.component.scss']
})
export class MessageBoxComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: MessageBoxOptions
    ) {
        data.okButtonHtml = data.okButtonHtml || 'Ok';
    }
}
