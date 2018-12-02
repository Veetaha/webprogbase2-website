import { Component, OnInit } from '@angular/core';
import { Router            } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog         } from '@angular/material/dialog';

import { SessionService       } from '@services/session';
import { AuthService          } from '@services/auth';
import { RoutingService       } from '@services/routing';
import { PageHeaderService    } from '@services/page-header';
import { ErrorHandlingService } from '@services/error-handling';
import { MessageBoxComponent, MessageBoxOptions } from '@vee/components/message-box';

import * as Vts from 'vee-type-safe';
import * as Api from '@public-api/v1';

import LoginRequest  = Api.Auth.Login.Post.Request;
import LoginResponse = Api.Auth.Login.Post.Response;


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls:  ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    credentials: LoginRequest = {
        login: '',
        password: ''
    };

    Api = Api.Data.User;

    constructor(
        private session:    SessionService,
        private auth:       AuthService,
        private rt:         RoutingService,
        private pageHeader: PageHeaderService,
        private router:     Router,
        private error:      ErrorHandlingService,
        private dialog:     MatDialog
    ) { }
  
    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Login' });
    }

    onFormSubmit() {
        this.auth.login(this.credentials).subscribe(
            res => {
                this.session.rawToken = res.jwt;
                this.router.navigateByUrl(this.rt.to.home());
            },
            err => {
                if (!(err instanceof HttpErrorResponse) ||
                    !Vts.conforms<LoginResponse.Failure>(err.error, LoginResponse.FailureTD)) {
                    return this.error.handle(err);
                }
                this.dialog.open<MessageBoxComponent, MessageBoxOptions>(
                    MessageBoxComponent, {
                    data: {
                        contentHtml: `Failure: ${err.error.failure}`,
                        titleHtml:   `Login failure`
                    }
                });
            }
        );
    }

}
