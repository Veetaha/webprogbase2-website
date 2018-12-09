import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { 
    TrcEditComponent, TrcEditResult, TrcEditOptions 
} from "@app/courses/trc-edit";

@Injectable({
    providedIn: 'root'
})
export class TrcEditService {
    constructor(
        private dialog: MatDialog
    ) {
        
    }

    openTrcEditDialog(options: TrcEditOptions) {
        return this.dialog.open<TrcEditComponent, TrcEditOptions, TrcEditResult>(
            TrcEditComponent, {
            data: options
        }).afterClosed();
    }
}