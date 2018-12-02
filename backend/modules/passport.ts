import * as passport  from 'passport';
import * as express   from 'express';
import * as Vts       from 'vee-type-safe';
import * as Apollo    from 'apollo-server-express';

import { Strategy as LocalStrategy           } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import * as Config     from '@app/config';
import * as ApiV1      from '@public-api/v1';
import { User        } from '@models/user';
import { tryFindById } from '@modules/common';
import { unauthorized, forbidden, invalidJwt } from '@modules/error';
import { Debug } from 'veetaha-web';

export interface AuthInfo {
    message: string;
}

declare global {
    namespace Express {
        interface Request {
            authInfo?: AuthInfo; // modified declaration file
            user?: User;         //
        }
    }
}


passport.use(new LocalStrategy({
        usernameField: 'login'
    },  async (login, password, done) => {
    const mismatch = Vts.mismatch(
        { login, password }, ApiV1.Routes.Auth.Login.Post.RequestTD
    );
    if (mismatch) {
        return done(null, false, { message: mismatch.toErrorString() });
    }
    try {
        const user = await User.findByLoginPassword(login, password);
        return user
            ? done(null, user)
            : done(null, false, { message: 'incorrect login or password.' });
    } catch (err) {
        return done(err);
    }
}))
.use(new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:    Config.RsaPublicKey
    },
    async (untrustedJwtPayload: unknown, done) => {
        const mismatch = Vts.mismatch(untrustedJwtPayload, ApiV1.Data.JwtPayloadTD);
        if (mismatch) {
            return done(invalidJwt(mismatch));
        }
        const jwtPayload = untrustedJwtPayload as ApiV1.Data.JwtPayload;
        try {
            const user = await tryFindById(User, jwtPayload.sub);
            return user          ?
                done(null, user) :
                done(unauthorized('invalid jwt, user not found'));
        } catch (err) {
            return done(err);
        }
    }
));

export async function authenticate(req: express.Request) {
    return !req.headers.authorization ? null :
        new Promise<User>((resolve, reject) => passport.authenticate('jwt', { session: false },
        (err, user?: User, info?: AuthInfo) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                Debug.assert(info);
                return reject(new Apollo.AuthenticationError(info!.message));
            }
            return resolve(user);
        })(req));
}


export function ensureUserCanAccessRoute(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    passport.authenticate('jwt', { session: false },
        (err, user?: User, info?: AuthInfo) => {
            req.user     = user;
            req.authInfo = info;
            if (err) {
                return next(err);
            }
            const urlPattern = `${req.baseUrl}${req.route.path}`;
            const methodAccess = ApiV1.RouteAccess[
                req.method as ApiV1.HttpMethod
            ];
            Debug.assert(methodAccess);
            const roleAccess = methodAccess[urlPattern];
            Debug.assert(roleAccess);
            if (!user) {
                if (!roleAccess.has(ApiV1.UserRole.Guest)) {
                    Debug.assert(info);
                    return next(unauthorized(info!.message));
                }
                return next();
            }
            if (!roleAccess || !roleAccess.has(user.role)) {
                return next(forbidden());
            }
            return next();
        })(req, res, next);
}