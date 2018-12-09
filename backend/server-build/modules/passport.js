'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const passport = require('passport');
const Vts = require('vee-type-safe');
const Apollo = require('apollo-server-express');
const passport_local_1 = require('passport-local');
const passport_jwt_1 = require('passport-jwt');
const Config = require('../config');
const ApiV1 = require('../public-api/v1/index');
const user_1 = require('../models/user');
const common_1 = require('./common');
const error_1 = require('./error');
const veetaha_web_1 = require('veetaha-web');
// declare global {
//     namespace Express {
//         interface Request {
//             authInfo?: AuthInfo; // beware, modified declaration file
//             user?: User;         // '@types/passport.js'
//         }
//     }
// }
passport.use(new passport_local_1.Strategy({ usernameField: 'login' }, async (login, password, done) => {
    const mismatch = Vts.mismatch({
        login,
        password
    }, ApiV1.Routes.Auth.Login.Post.RequestTD);
    if (mismatch) {
        return done(null, false, { message: mismatch.toErrorString() });
    }
    try {
        const user = await user_1.User.findByLoginPassword(login, password);
        return user ? done(null, user) : done(null, false, { message: 'incorrect login or password.' });
    } catch (err) {
        return done(err);
    }
})).use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Config.RsaPublicKey
}, async (untrustedJwtPayload, done) => {
    const mismatch = Vts.mismatch(untrustedJwtPayload, ApiV1.Data.JwtPayloadTD);
    if (mismatch) {
        return done(error_1.invalidJwt(mismatch));
    }
    const jwtPayload = untrustedJwtPayload;
    try {
        const user = await common_1.tryFindById(user_1.User, jwtPayload.sub);
        return user ? done(null, user) : done(error_1.unauthorized('invalid jwt, user not found'));
    } catch (err) {
        return done(err);
    }
}));
async function authenticate(req) {
    return !req.headers.authorization ? null : new Promise((resolve, reject) => passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return reject(err);
        }
        if (!user) {
            veetaha_web_1.Debug.assert(info);
            return reject(new Apollo.AuthenticationError(info.message));
        }
        return resolve(user);
    })(req));
}
exports.authenticate = authenticate;
function ensureUserCanAccessRoute(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        req.user = user;
        req.authInfo = info;
        if (err) {
            return next(err);
        }
        const urlPattern = `${ req.baseUrl }${ req.route.path }`;
        const methodAccess = ApiV1.RouteAccess[req.method];
        veetaha_web_1.Debug.assert(methodAccess);
        const roleAccess = methodAccess[urlPattern];
        veetaha_web_1.Debug.assert(roleAccess);
        if (!user) {
            if (!roleAccess.has(ApiV1.UserRole.Guest)) {
                veetaha_web_1.Debug.assert(info);
                return next(error_1.unauthorized(info.message));
            }
            return next();
        }
        if (!roleAccess || !roleAccess.has(user.role)) {
            return next(error_1.forbidden());
        }
        return next();
    })(req, res, next);
}
exports.ensureUserCanAccessRoute = ensureUserCanAccessRoute;