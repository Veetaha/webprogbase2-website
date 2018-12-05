import { NgStyle, NgClass } from '@angular/common';
import { RouteFn } from '@routes/paths';


export interface Pagination {
    page: number;
    limit: number;
    search?: string;
}

export interface Identifiable {
    id: string;
}

export interface Paginated<T> {
    data: T[];
    total: number;
}


export interface ButtonLink {
    routerLink: string;
    name:       string;
    classList?: string;
}

export interface ToolButtonRouterLink<
    TArgs extends string[] = [],
    TPathFn extends RouteFn<TArgs> = RouteFn<TArgs>
> {
    pathFn: TPathFn;
    args?:   TArgs;
}

export interface ToolButton<TArgs extends string[] = string[]> {
    routerLink: ToolButtonRouterLink<TArgs>;
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

export type Maybe<T> = T | null | undefined;