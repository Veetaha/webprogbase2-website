import { Injectable        } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService    } from '@services/session';
import { RoutingService    } from '@services/routing';

import * as Api from '@public-api/v1';
import * as RxO from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserRoleGuardService implements CanActivate {

    constructor(
        private session: SessionService,
        private router:  Router,
        private rt:      RoutingService
    ) {}

    canActivate(route: ActivatedRouteSnapshot) {
        const allowedRoles: Set<Api.UserRole> = route.data.access;
        return this.session.isFetchingUser()
            ? this.session.$onUserFetched
                  .pipe(RxO.map(user => this.validateActivation(allowedRoles, user)))
            : this.validateActivation(allowedRoles, this.session.user);
    }

    validateActivation(allowedRoles: Set<Api.UserRole>, user: Api.Data.User.Json | null) {
        if (!allowedRoles.has(user ? user.role : Api.UserRole.Guest)) {
            if (!this.session.isAuthorized()) {
                this.router.navigateByUrl(this.rt.to.login());
            } else {
                this.rt.navigateToForbidden();
            }
            return false;
        }
        return true;
    }
}
