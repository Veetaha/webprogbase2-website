import { NgStyle, NgClass } from '@angular/common';

export interface ButtonLink {
    routerLink: string;
    name:       string;
    classList?: string;
}

export interface ToolButton {
    routerLink: string;
    iconName:   string;
    classList?: NgClass['ngClass'];
    styles?:    NgStyle['ngStyle'];
    name:       string;
}

export namespace MatrixRouteParams {
    export interface Messageful {
        message: string;
    }

    export type Forbidden = Messageful;

    export interface Error extends Messageful {
        status: string;
    }
}
