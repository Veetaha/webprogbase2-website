import { NgModule             } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRoleGuardService } from '@guards/user-role-guard.service';

import { GroupComponent      } from '@app/groups/group/group.component';
import { GroupsComponent     } from '@app/groups/groups.component';
import { GroupEditComponent  } from '@app/groups/group-edit/group-edit.component';
import { GroupNewComponent   } from '@app/groups/group-new/group-new.component';

import * as RoutePaths from '@routes/paths';

const RoleGuard = [ UserRoleGuardService ];

const routes: Routes = [
    {
        path:           RoutePaths.groupEdit.rel(':id'),
        component:      GroupEditComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.groupEdit.access }
    }, {
        path:           RoutePaths.groupNew.rel(),
        component:      GroupNewComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.groupNew.access }
    }, {
        path:           RoutePaths.group.rel(':id'),
        component:      GroupComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.group.access }
    }, {
        path:           RoutePaths.groups.rel(),
        component:      GroupsComponent,
        canActivate:    RoleGuard,
        data: { access: RoutePaths.groups.access }
    }
];



@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class GroupsRoutingModule { }
