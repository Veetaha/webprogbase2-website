import { NgModule             } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRoleGuardService } from '@guards/user-role-guard.service';
import { UserComponent        } from '@app/users/user/user.component';
import { UserEditComponent    } from '@app/users/user-edit/user-edit.component';
import { LoginComponent       } from '@app/users/login/login.component';
import { RegisterComponent    } from '@app/users/register/register.component';
import { UsersComponent       } from '@app/users/users.component';

import * as RoutePaths from '@routes/paths';

const RoleGuard = [ UserRoleGuardService ];

const routes: Routes = [
    {
        path:           RoutePaths.login.rel(),
        component:      LoginComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.login.access }
    }, {
        path:           RoutePaths.register.rel(),
        component:      RegisterComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.register.access }
    }, {
        path:           RoutePaths.userEdit.rel(':id'),
        component:      UserEditComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.userEdit.access }
    }, {
        path:           RoutePaths.user.rel(':id'),
        component:      UserComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.user.access }
    }, {
        path:           RoutePaths.users.rel(),
        component:      UsersComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.users.access }
    }
    // {
    //     path: RoutePaths.groups.rel(),
    //     component: GroupsComponent,
    //     data: { access: Api.Authenticated }
    // },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }
