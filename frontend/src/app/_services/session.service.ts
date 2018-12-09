import { Injectable, EventEmitter } from '@angular/core';
import { JwtHelperService         } from '@auth0/angular-jwt';
import { Defaults                 } from '@services/config';
import { ErrorHandlingService     } from '@services/error-handling';
import { UsersService             } from '@services/users';
import { nextTick                 } from '@utils/helpers';

import * as Api from '@public-api/v1';
import * as Gql from '@services/gql';
import * as Vts from 'vee-type-safe';
import * as Rx  from 'rxjs';
import * as RxO from 'rxjs/operators';


import TokenStorageKey = Defaults.Token.StorageKey;

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    public onLogout       = new EventEmitter<void>();
    public onExpired      = new EventEmitter<void>();
    public $user          = new Rx.BehaviorSubject<Api.Data.User.Json | null>(null);
    public $onUserFetched = new Rx.Subject<Api.Data.User.Json | null>();

    public get user() {
        return this.$user.value;
    }
    public set user(value) {
        this.$user.next(value);
    }

    private expirationTimerId = 0;

    canUserViewTaskResults() {
        return Gql.Access.Task.getLocalTaskResults.has(this.userRole);
    }

    constructor(
        private jwtHelper:  JwtHelperService,
        private errHandler: ErrorHandlingService,
        private backend:    UsersService
    ) {
        window.onstorage = ({key, newValue}) => {
            if (key === TokenStorageKey) {
                if (newValue) {
                    this.setExpiration(newValue);
                    this.fetchUser().subscribe();
                } else {
                    this.cancelTokenExpirationEvent();
                    this.user = null;
                    this.onLogout.emit();
                }
            }
        };

        const initialToken = this.rawToken;
        if (!initialToken || this.isTokenExpired(initialToken)) {
            localStorage.removeItem(TokenStorageKey);
            return;
        }
        this.setExpiration(initialToken);
        nextTick(() => this.fetchUser().subscribe(user => this.$onUserFetched.next(user)));
    }

    logout() {
        this.user = this.rawToken = null;
        this.onLogout.emit();
    }

    isFetchingUser() {
        return this.isAuthorized() && !this.user;
    }

    isAuthorized() {
        const token = this.rawToken;
        return token && !this.isTokenExpired(token);
    }

    get tokenPayload(): null | Api.Data.JwtPayload {
        const rawToken = this.rawToken;
        return !rawToken ? null : this.jwtHelper.decodeToken(rawToken);
    }

    get rawToken() {
        return localStorage.getItem(TokenStorageKey);
    }

    set rawToken(token: string | null) {
        if (!token) {
            this.cancelTokenExpirationEvent();
            localStorage.removeItem(TokenStorageKey);
            this.user = null;
            this.onLogout.emit();
        } else {
            this.setExpiration(token);
            localStorage.setItem(TokenStorageKey, token);
            this.fetchUser().subscribe();
        }
    }

    get userRole() {
        return this.user ? this.user.role : Api.UserRole.Guest;
    }

    private setExpiration(token: string) {
        this.cancelTokenExpirationEvent();
        if (this.isTokenExpired(token)) {
            return console.error('Tried to set expiration event for already expired token');
        }
        const expDate = this.jwtHelper.getTokenExpirationDate(token);
        this.expirationTimerId = Vts.reinterpret<number>(setTimeout(
            () => {
                this.rawToken = null;
                this.onExpired.emit();
            },
            expDate!.getTime() - Date.now()
        ));
    }

    private cancelTokenExpirationEvent() {
        if (this.expirationTimerId) {
            clearTimeout(this.expirationTimerId);
            this.expirationTimerId = 0;
        }
    }

    private isTokenExpired(token: string) {
        return this.jwtHelper.isTokenExpired(token);
    }

    private fetchUser() {
        return this.backend.getMe().pipe(
            RxO.tap(user => {
                this.user = user;
                this.$onUserFetched.next(user);
            }),
            RxO.catchError(err => {
                this.rawToken = null;
                this.$onUserFetched.next(null);
                this.errHandler.handle(err);
                throw err;
            })
        );
    }
}
