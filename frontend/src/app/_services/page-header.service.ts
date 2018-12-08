import { Injectable  } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToolButton  } from '@common/interfaces';
import { nextTick    } from '@utils/helpers';
import { MatDialog   } from '@angular/material/dialog';
import {
    ConfirmDialogComponent,
    ConfirmDialogOptions,
    ConfirmDialogResult
} from '@vee/components/confirm-dialog';

import * as RxO from 'rxjs/operators';
import * as Rx from 'rxjs';

export interface SetHeaderOptions {
    title: string;
    toolButtons?: ToolButton[];
    loading?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class PageHeaderService {
    $title       = new Rx.BehaviorSubject('');
    $toolButtons = new Rx.BehaviorSubject<ToolButton[]>([]);
    $loading     = new Rx.BehaviorSubject(false);

    get title()            { return this.$title.value; }
    set title(value)       { nextTick(() => this.$title.next(value)); }
    get toolButtons()      { return this.$toolButtons.value; }
    set toolButtons(value) { nextTick(() => this.$toolButtons.next(value)); }
    get loading()          { return this.$loading.value; }
    set loading(value)     { nextTick(() => this.$loading.next(value)); }

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}


    private loadings = 0;

    displayLoading<T>() {
        this.loading = true;
        ++this.loadings;
        return RxO.tap<T>(() => {
            if (!--this.loadings) {
                this.loading = false;
            }
        });
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

    openConfirmDialog(options: ConfirmDialogOptions) {
        return this.dialog.open<ConfirmDialogComponent, ConfirmDialogOptions, ConfirmDialogResult>(
            ConfirmDialogComponent, {
            data: options
        }).afterClosed();
    }


    flashSnackBar(message: string, options: MatSnackBarConfig<unknown> = {
        duration: 1500 // ms
    }) {
        return this.snackBar.open(message, '', options);
    }

}
