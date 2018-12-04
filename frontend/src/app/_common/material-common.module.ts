import { NgModule } from '@angular/core';
import {
    DragDropModule
} from '@angular/cdk/drag-drop';
import {
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSnackBarModule
} from '@angular/material';

@NgModule({
    declarations: [],
    exports: [
        DragDropModule,

        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatTableModule,
        MatDividerModule,
        MatSelectModule,
        MatInputModule,
        MatDialogModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatSnackBarModule
    ]
})
export class MaterialCommonModule { }
