import { Injectable } from '@angular/core';
import { ToolButton } from '@common/interfaces';
import { nextTick } from '@utils/helpers';
import * as RxO from 'rxjs/operators';


export interface SetHeaderOptions {
    title: string;
    toolButtons?: ToolButton[];
    loading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PageHeaderService {
    _title = '';
    _toolButtons: ToolButton[] = [];
    _loading = false;

    get title()            { return this._title; }
    set title(value)       { nextTick(() => this._title = value); }
    get toolButtons()      { return this._toolButtons; }
    set toolButtons(value) { nextTick(() => this._toolButtons = value); }
    get loading()          { return this._loading; }
    set loading(value)     { nextTick(() => this._loading = value); }

    displayLoading<T>() {
        this.loading = true;
        return RxO.tap<T>(() => this.loading = false);
    }

    setHeader({ title = 'Loading...', toolButtons = [], loading = false }: SetHeaderOptions
        = { title: 'Loading...', toolButtons: [], loading: false }
    ) {
        nextTick(() => {
            this.title       = title;
            this.toolButtons = toolButtons;
            this.loading     = loading;
        });
    }

}
