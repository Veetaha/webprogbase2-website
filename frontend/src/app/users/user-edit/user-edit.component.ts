import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService         } from '@services/session';
import { PageHeaderService      } from '@services/page-header';
import { ErrorHandlingService   } from '@services/error-handling';
import { UsersService           } from '@services/users';
import { RoutingService         } from '@services/routing';
import { Subscriber             } from '@utils/subscriber';

import * as Vts    from 'vee-type-safe';
import * as Api    from '@public-api/v1';
import * as Gql    from '@services/gql';
import * as GqlApi from '@public-api/v1/gql';

@Component({
  selector:    'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls:  ['./user-edit.component.scss']
})
export class UserEditComponent extends Subscriber implements OnInit {
    user?: Gql.GetUser.User;
    input: Gql.UpdateUserPatch = {};
    // { [Key in keyof Gql.UpdateUserPatch]: Exclude<Gql.UpdateUserPatch[Key], null> } = {};
    Api = Api.Data.User;
    RoleLimit = Api.V1.User.Put.RoleLimit;

    get canDeleteUser() {
        
        return Api.RouteAccess.DELETE[Api.V1.User.Delete._(':id')]
                  .has(this.session.userRole);
    }

    userRoles = Object.values(Api.UserRole).filter(role => role !== Api.UserRole.Guest);

    constructor(
        public  session:    SessionService,
        public  rt:         RoutingService,
        private router:     Router,
        private route:      ActivatedRoute,
        private backend:    UsersService,
        private pageHeader: PageHeaderService,
        private errHandler: ErrorHandlingService
    ) { super(); }
    
    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Edit profile' });
        this.subscrs.sessionUser = this.session.$user.subscribe(
            () => this.onUserChange()
        );

        this.subscrs.user = this.route.paramMap.subscribe(paramMap => {
            const userId = paramMap.get('id')!;
            if (this.session.user && this.session.user.id === userId) {
                return this.setUser(this.session.user);
            }
            this.backend.getUser({ id: userId })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(
                    res => this.setUser(res.data.getUser.user),
                    err => this.errHandler.handle(err)
                );
        });
    }

    setUser(user: Gql.GetUser.User) {
        this.user  = user;
        this.input = Vts.take(user, (
            this.session.userRole === GqlApi.UserRole.Admin
                ? GqlApi.UpdateUserPatchFields
                : GqlApi.UpdateMePatchFields
        ) as (keyof Gql.GetUser.User)[]);
        this.onUserChange();
    }

    onFormSubmit() {
        const submittedUserId = this.user!.id;
        if (this.session.user && this.session.user.id === submittedUserId) {
            const newMe = { ...this.session.user, ...this.input };
            return this.backend.updateMe({ patch: this.input }).subscribe(() => {
                this.session.user = newMe as Api.Data.User.Json;
                this.router.navigateByUrl(this.rt.to.user(submittedUserId));
            });
        }
        return this.backend.updateUser({ id: submittedUserId, patch: this.input }).subscribe(
            ()  => this.router.navigateByUrl(this.rt.to.user(submittedUserId)),
            err => this.errHandler.handle(err)
        );
    }

    onDeleteDemand() {
        const deletedUser = this.user!;
        this.backend.deleteUser(deletedUser.id).subscribe(
            () => {
                if (this.session.user && this.session.user.id === deletedUser.id) {
                    this.session.logout();
                    this.router.navigateByUrl(this.rt.to.login());
                }
            },
            err => this.errHandler.handle(err)
        );
    }

    onUserChange() {
        if (this.user && this.session.user &&        (
            !this.session.isAuthorized()            ||
            !this.rt.canAccess(this.rt.to.userEdit) ||
            !Api.V1.User.Put.canPut({ issuer: this.session.user, targetId: this.user.id }))) {
            this.rt.navigateToForbidden();
        }
    }

}
