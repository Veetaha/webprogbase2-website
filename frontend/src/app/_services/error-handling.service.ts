import { Injectable } from '@angular/core';
import { Router     } from '@angular/router';
import { MatrixRouteParams } from '@common/interfaces';

import * as Vts        from 'vee-type-safe';
import * as RoutePaths from '@routes/paths';
import * as HttpCodes  from 'http-status-codes';
import * as RxO        from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class ErrorHandlingService {

    constructor(
        private router: Router
    ) {}

    handler<T>() {
        return RxO.catchError<T, T>(
            (err: Vts.BasicObject) => {
                this.handle(err);
                throw err;
            }
        );
    }

    handle(err: Vts.BasicObject) {
        this.navigateToError({
            status:  String(err.status || HttpCodes.NOT_IMPLEMENTED),
            message: String((
                err                          &&
                Vts.isBasicObject(err.error) &&
                err.error.error              ) ||
                (err.message)                ||
                'No reason specified'
            )
        });
    }

    private  navigateToError(params: MatrixRouteParams.Error) {
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
