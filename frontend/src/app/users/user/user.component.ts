import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService         } from '@services/session';
import { PageHeaderService      } from '@services/page-header';
import { ErrorHandlingService   } from '@services/error-handling';
import { UsersService           } from '@services/users';
import { RoutingService         } from '@services/routing';
import { Subscriber             } from '@utils/subscriber';


import * as Api from '@public-api/v1';
import * as Gql from '@services/gql';

import User = Gql.GetUser.User;

@Component({
  selector:    'app-user-profile',
  templateUrl: './user.component.html',
  styleUrls:  ['./user.component.scss']
})
export class UserComponent extends Subscriber implements OnInit {
    user?: User;

    get userId() {
        return this.user ? this.user.id : this.route.snapshot.paramMap.get('id')!;
    }

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
        this.pageHeader.setHeader({ title: 'User profile' });
        this.subscrs.sessionUser = this.session.$user.subscribe(
            () => this.updateEditToolButton()
        );

        this.subscrs.user = this.route.paramMap.subscribe(paramMap =>
            this.backend
                .getUser({ id: paramMap.get('id')! })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(
                    res => {
                        this.user = res.data.getUser.user;
                        this.updateEditToolButton();
                    },
                    err => this.errHandler.handle(err)
                )
            );
    }

    onLogout() {
        this.session.logout();
        this.pageHeader.flashSnackBar('You are now logged out')
        this.router.navigateByUrl(this.rt.to.login());
    }

    updateEditToolButton() {
        if (!this.user                              ||
            !this.session.user                      ||
            !this.rt.canAccess(this.rt.to.userEdit) ||
            !Api.V1.User.Put.canPut({ issuer: this.session.user, targetId: this.user.id })) {
            this.pageHeader.toolButtons = [];
            return;
        }
        this.pageHeader.toolButtons = [{
            iconName: 'edit',
            name: 'Edit profile',
            routerLink: {
                pathFn: this.rt.to.userEdit,
                args:  [this.user.id]
            }
        }];
    }

}
