import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent        } from '@app/home/home.component';
import { CoursesComponent     } from '@app/courses/courses.component';
import { UsersComponent       } from '@app/users/users.component';
import { AboutComponent       } from '@app/about/about.component';
import { DeveloperComponent   } from '@app/developer/developer.component';
import { ErrorComponent       } from '@app/error/error.component';
import { UserRoleGuardService } from '@guards/user-role-guard.service';
import { ForbiddenComponent   } from '@app/error/forbidden/forbidden.component';

import * as RoutePaths from './paths';


const RoleGuard = [ UserRoleGuardService ];

const AppRoutes: Routes = [
    {
        path:            RoutePaths.about.rel(),
        component:       AboutComponent,
        canActivate:     RoleGuard,
        data: { access:  RoutePaths.about.access }
    }, {
        path:           RoutePaths.courses.rel(),
        component:      CoursesComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.courses.access }
    }, {
        path:           RoutePaths.users.rel(),
        component:      UsersComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.users.access }
    }, {
        path:           RoutePaths.developer.rel(),
        component:      DeveloperComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.developer.access },
        pathMatch:      'full'
    }, {
        path:           RoutePaths.home.rel(),
        component:      HomeComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.home.access },
        pathMatch:      'full'
    }, {
        path:           RoutePaths.forbidden.rel(),
        component:      ForbiddenComponent,
        // canActivate:    RoleGuard,
        // data: { access: RoutePaths.forbidden.access }
    }, {
        path:           RoutePaths.error.rel(),
        component:      ErrorComponent,
        // canActivate:    RoleGuard,
        // data: { access: RoutePaths.error.access }
    },
    {
        path: '**',
        redirectTo: `error;status=404;message=${
            encodeURIComponent('Not found')
        }`
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            AppRoutes // , { enableTracing: true }
        )
    ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }
