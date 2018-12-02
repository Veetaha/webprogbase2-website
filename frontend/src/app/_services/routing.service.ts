import { Injectable        } from '@angular/core';
import { Router            } from '@angular/router';
import { MatrixRouteParams } from '@common/interfaces';
import { SessionService    } from '@services/session';

import * as RoutePaths from '@routes/paths';
type RoutePaths = typeof RoutePaths;

@Injectable({
    providedIn: 'root'
})
export class RoutingService  {
    constructor(
        private router: Router,
        private session: SessionService
    ) {}
    
    to = RoutePaths;

    canAccess(accessInfo: RoutePaths.RouteFn) {
        return accessInfo.access.has(this.session.userRole);
    }

    navigateToError(params: MatrixRouteParams.Error) {
        this.router.navigate([ RoutePaths.error(), params ]);
    }
    navigateToForbidden(
        params: MatrixRouteParams.Forbidden = {
            message: 'Access denied. Appeal to administrator, please.'
        }
    ) {
        this.router.navigate([ RoutePaths.forbidden(), params ]);
    }
}




