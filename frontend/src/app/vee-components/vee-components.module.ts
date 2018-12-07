import { NgModule             } from '@angular/core';
import { CommonModule         } from '@angular/common';
import { RouterModule         } from '@angular/router';
import { MaterialCommonModule } from '@common/material-common.module';

import { HamburgerButtonComponent } from './hamburger-button';
import { SearchInputComponent     } from './search-input';
import { SlideMenuComponent       } from './slide-menu';
import { MessageBoxComponent      } from './message-box';
import { ConfirmDialogComponent   } from './confirm-dialog';
import { 
    PaginationComponent, 
    PaginatedDirective      
} from './pagination';
import { 
    ListSelectorComponent,
    FreeItemDirective,
    ChosenItemDirective
} from './list-selector';


const Directives = [
    HamburgerButtonComponent,
    SearchInputComponent,
    SlideMenuComponent,
    MessageBoxComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    ListSelectorComponent,

    PaginatedDirective,
    FreeItemDirective,
    ChosenItemDirective
];
@NgModule({
    declarations: Directives,
    exports: Directives,
    imports: [ CommonModule, RouterModule, MaterialCommonModule ],
    entryComponents: [
        MessageBoxComponent,
        ConfirmDialogComponent
    ]
})
export class VeeComponentsModule { }
