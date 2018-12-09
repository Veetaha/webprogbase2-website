import { NgModule             } from '@angular/core';
import { CommonModule         } from '@angular/common';
import { CoursesRoutingModule } from '@routes/courses';
import { AppCommonModule      } from '@common/app-common.module';
import { GroupsModule         } from '@app/groups/groups.module';

import { BrowserModule        } from '@angular/platform-browser';
import { FormsModule          } from '@angular/forms';
import { CoursesComponent     } from './courses.component';
import { TaskComponent        } from './task/task.component';
import { TaskNewComponent     } from './task-new/task-new.component';
import { CourseComponent      } from './course/course.component';
import { CourseNewComponent   } from './course-new/course-new.component';
import { CourseEditComponent  } from './course-edit/course-edit.component';
import { TaskEditComponent    } from './task-edit/task-edit.component';
import { TaskResultComponent  } from './task-result/task-result.component';
import { TaskResultsComponent } from './task-results/task-results.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        CommonModule,
        CoursesRoutingModule,
        GroupsModule,

        AppCommonModule
    ],
    declarations: [
        TaskComponent,
        TaskNewComponent,
        CourseComponent,
        CoursesComponent,
        CourseNewComponent,
        CourseEditComponent,
        TaskEditComponent,
        TaskResultComponent,
        TaskResultsComponent
    ],
    providers: []
})
export class CoursesModule { }
