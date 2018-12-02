import { Component, OnInit       } from '@angular/core';

import { HttpErrorResponse       } from '@angular/common/http';
import { Router                  } from '@angular/router';
import { MatDialog               } from '@angular/material/dialog';
import { MessageBoxOptions, MessageBoxComponent } from '@vee/components/message-box';
import * as Api from '@public-api/v1';
import * as Vts from 'vee-type-safe';
import { escapeStringRegExp } from '@utils/helpers';

import { ErrorHandlingService } from '@services/error-handling';
import { PageHeaderService    } from '@services/page-header';
import { RoutingService       } from '@services/routing';
import { SessionService       } from '@services/session';
import { AuthService          } from '@services/auth';

import RegisterResponse = Api.Auth.Register.Post.Response;
import RegisterRequest  = Api.Auth.Register.Post.Request;

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls:  ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    credentials: RegisterRequest = {
        login:    '',
        password: '',
        fullname: ''
    };

    Api = Api.Data.User;
    escapeRegExp = escapeStringRegExp;


    constructor(
        private error:      ErrorHandlingService,
        private pageHeader: PageHeaderService,
        private rt:    RoutingService,
        private session:    SessionService,
        private auth:       AuthService,
        private dialog:     MatDialog,
        private router:     Router
    ) { }
  
    ngOnInit() {
        this.pageHeader.setHeader({
            title: 'Register'
        });
    }

    onFormSubmit() {
        this.auth.register(this.credentials).subscribe(
            res => {
                this.session.rawToken = res.jwt;
                void this.router.navigateByUrl(this.rt.to.home());
            },
            err => {
                if (!(err instanceof HttpErrorResponse) ||
                    !Vts.conforms<RegisterResponse.Failure>(err.error, RegisterResponse.FailureTD)) {
                    return this.error.handle(err);
                }
                this.dialog.open<MessageBoxComponent, MessageBoxOptions>(
                    MessageBoxComponent, {
                    data: {
                        contentHtml: `Failure: ${err.error.failure}`,
                        titleHtml:   `Registration failure`
                    }
                });
            }
        );
    }

}
