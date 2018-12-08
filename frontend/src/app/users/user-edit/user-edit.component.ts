import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService         } from '@services/session';
import { PageHeaderService      } from '@services/page-header';
import { ErrorHandlingService   } from '@services/error-handling';
import { UsersService           } from '@services/users';
import { RoutingService         } from '@services/routing';
import { Subscriber             } from '@utils/subscriber';

import * as _      from 'lodash';
import * as RxO    from 'rxjs/operators';
import * as Vts    from 'vee-type-safe';
import * as Api    from '@public-api/v1';
import * as Gql    from '@services/gql';
import * as GqlApi from '@public-api/v1/gql';

import User = Gql.GetUserForEdit.User;

@Component({
  selector:    'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls:  ['./user-edit.component.scss']
})
export class UserEditComponent extends Subscriber implements OnInit {
    user?: User;
    input: Gql.UpdateUserPatch = {};
 
    Api = Api.Data.User;
    RoleLimit = Api.V1.User.Put.RoleLimit;

    get userId() {
        return this.user ? this.user.id : this.route.snapshot.paramMap.get('id')!
    }

    get canDeleteUser() {
        return false;
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

        this.subscrs.user = this.route.paramMap
            .pipe(
                RxO.map(
                    paramMap => this.backend.getUserForEdit({ id: paramMap.get('id')! })
                ),
                this.pageHeader.displayLoading(),
                RxO.flatMap(val => val)
            ).subscribe(
                res => this.setUser(res.data.getUser.user),
                err => this.errHandler.handle(err)
            );
    }

    setUser(user: User) {
        this.user  = _.cloneDeep(user);
        this.input = Vts.take(user, (
            this.session.userRole === GqlApi.UserRole.Admin
                ? GqlApi.UpdateUserPatchFields
                : GqlApi.UpdateMePatchFields
        ) as (keyof User)[]);
        this.onUserChange();
    }

    onFormSubmit() {
        const submittedUserId = this.userId;
        if (this.session.userRole !== Gql.UserRole.Admin) {
            const newMe = { ...this.session.user, ...this.input };
            return this.backend
                .updateMe({ patch: this.input })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(() => {
                    this.session.user = newMe as Api.Data.User.Json;
                    this.router.navigateByUrl(this.rt.to.user(submittedUserId));
                });
        }
        return this.backend.updateUser({ 
            id: submittedUserId, 
            patch: this.input
        })  .pipe(this.pageHeader.displayLoading())
            .subscribe(
                ()  => this.router.navigateByUrl(this.rt.to.user(submittedUserId)),
                err => this.errHandler.handle(err)
            );
    }

    // onDeleteDemand() {
    //     const deletedUser = this.user!;
    //     this.backend
    //         .deleteUser(deletedUser.id)
    //         .pipe(this.pageHeader.displayLoading())
    //         .subscribe(
    //         () => {
    //             if (this.session.user && this.session.user.id === deletedUser.id) {
    //                 this.session.logout();
    //                 this.pageHeader.flashSnackBar(
    //                     `Successfully deleted your account`
    //                 );
    //                 this.router.navigateByUrl(this.rt.to.login());
    //             }
    //         },
    //         err => this.errHandler.handle(err)
    //     );
    // }

    onUserChange() {
        if (this.user && this.session.user &&        (
            !this.session.isAuthorized()            ||
            !this.rt.canAccess(this.rt.to.userEdit) ||
            !Api.V1.User.Put.canPut({ issuer: this.session.user, targetId: this.user.id }))) {
            this.rt.navigateToForbidden();
        }
    }

}
