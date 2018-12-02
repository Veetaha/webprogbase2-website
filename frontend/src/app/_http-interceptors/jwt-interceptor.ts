import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from '@services/session';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private session: SessionService
    ) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const rawToken = this.session.rawToken;
        return next.handle(rawToken
            ? req.clone({
                headers: req.headers.set('Authorization', `Bearer ${rawToken}`)
            })
            : req
        );
    }
}
