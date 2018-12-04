import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsRoutingModule } from '@routes/groups';
import { AppCommonModule } from '@common/app-common.module';

import { BrowserModule       } from '@angular/platform-browser';
import { FormsModule         } from '@angular/forms';
import { GroupsComponent     } from './groups.component';
import { GroupComponent      } from './group/group.component';
import { GroupEditComponent  } from './group-edit/group-edit.component';
import { GroupNewComponent   } from './group-new/group-new.component';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        CommonModule,
        GroupsRoutingModule,

        AppCommonModule
    ],
    declarations: [
        GroupsComponent,
        GroupComponent,
        GroupEditComponent,
        GroupNewComponent
    ],
    providers: [
        // MarkdownService
    ]
})
export class GroupsModule { }
