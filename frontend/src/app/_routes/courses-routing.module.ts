import { NgModule             } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskComponent        } from '@app/courses/task/task.component';
import { TaskEditComponent    } from '@app/courses/task-edit/task-edit.component';
import { TaskNewComponent     } from '@app/courses/task-new/task-new.component';
import { CourseComponent      } from '@app/courses/course/course.component';
import { CourseNewComponent   } from '@app/courses/course-new/course-new.component';
import { CourseEditComponent  } from '@app/courses/course-edit/course-edit.component';
import { UserRoleGuardService } from '@guards/user-role-guard.service';

import * as RoutePaths from '@routes/paths';

const RoleGuard = [ UserRoleGuardService ];

const routes: Routes = [
    {
        path:           RoutePaths.task.rel(':id'),
        component:      TaskComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.task.access }
    }, {
        path:           RoutePaths.taskEdit.rel(':id'),
        component:      TaskEditComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.taskEdit.access }
    }, {
        path:           RoutePaths.taskNew.rel(':id'),
        component:      TaskNewComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.taskNew.access }
    }, {
        path:           RoutePaths.courseEdit.rel(':id'),
        component:      CourseEditComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.courseEdit.access }
    }, {
        path:           RoutePaths.courseNew.rel(),
        component:      CourseNewComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.courseNew.access }
    }, {
        path:           RoutePaths.course.rel(':id'),
        component:      CourseComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.course.access }
    }
];



@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class CoursesRoutingModule { }
