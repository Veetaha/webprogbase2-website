import { NgModule             } from '@angular/core';
import { CommonModule         } from '@angular/common';
import { RouterModule         } from '@angular/router';
import { MaterialCommonModule } from '@common/material-common.module';

import { HamburgerButtonComponent } from './hamburger-button';
import { SearchInputComponent     } from './search-input';
import { SlideMenuComponent       } from './slide-menu';
import { MessageBoxComponent      } from './message-box';
import { ConfirmDialogComponent   } from './confirm-dialog';



const Components = [
    HamburgerButtonComponent,
    SearchInputComponent,
    SlideMenuComponent,
    MessageBoxComponent,
    ConfirmDialogComponent
];
@NgModule({
    declarations: Components,
    imports: [ CommonModule, RouterModule, MaterialCommonModule ],
    exports: Components,
    entryComponents: [
        MessageBoxComponent,
        ConfirmDialogComponent
    ]
})
export class VeeComponentsModule { }
