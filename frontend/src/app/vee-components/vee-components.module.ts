import { NgModule             } from '@angular/core';
import { CommonModule         } from '@angular/common';
import { BrowserModule        } from '@angular/platform-browser';
import { RouterModule         } from '@angular/router';
import { FormsModule          } from '@angular/forms';
import { MaterialCommonModule } from '@common/material-common.module';
import { AppMarkdownModule    } from '@common/app-markdown.module';
import { UcWidgetModule       } from 'ngx-uploadcare-widget';
import { AngularMarkdownEditorModule } from 'angular-markdown-editor';
import { MarkdownModule } from 'ngx-markdown';

import { HamburgerButtonComponent } from './hamburger-button';
import { SearchInputComponent     } from './search-input';
import { SlideMenuComponent       } from './slide-menu';
import { MessageBoxComponent      } from './message-box';
import { ConfirmDialogComponent   } from './confirm-dialog';
import { MarkdownEditorComponent  } from './markdown-editor';
import { FileDownloadComponent    } from './file-download';
import { FileUploadComponent      } from './file-upload';
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
    MarkdownEditorComponent,
    FileDownloadComponent,
    FileUploadComponent,

    PaginatedDirective,
    FreeItemDirective,
    ChosenItemDirective
];
@NgModule({
    declarations: Directives,
    exports: Directives,
    imports: [ 
        CommonModule,
        BrowserModule,
        FormsModule,
        RouterModule, 
        MaterialCommonModule,
        AppMarkdownModule,  // Beware to import this module AFTER FormsModule
        UcWidgetModule,
        AngularMarkdownEditorModule,
        MarkdownModule
    ],
    entryComponents: [
        MessageBoxComponent,
        ConfirmDialogComponent
    ]
})
export class VeeComponentsModule { }
