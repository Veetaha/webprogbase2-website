import * as express   from 'express';
import * as passport  from 'passport';
import * as VtsEx     from 'vee-type-safe/express';

import * as Config   from '@app/config';
import { AuthInfo }  from '@modules/passport';
import * as ApiV1    from '@public-api/v1';
import { User }      from '@models/user';
// import { ensureUserCanAccess } from '@modules/passport';

import Route        = ApiV1.Routes.Auth;
import PostLogin    = Route.Login.Post;
import PostRegister = Route.Register.Post;

export const router = express.Router()
.post(PostLogin.$, (req, res, next) => {
    passport.authenticate('local', { session: false },
    (authError: unknown, user?: User, info?: AuthInfo) => {
        if (authError) {
            return next(authError);
        }
        if (!user) {
            const failJsonres: PostLogin.Response.Failure = {
                failure: (info && info.message) ||
                         'undefined behaviour at Login.Post'
            };
            return res.status(PostLogin.Response.FailureStatus)
                      .json(failJsonres);
        }
        const jsonres: PostLogin.Response.Success = {
            jwt: user.makeJwt()
        };
        return res.json(jsonres);
   })(req, res);
})
.post(PostRegister.$,
    VtsEx.ensureTypeMatch(VtsEx.ReqBody, PostRegister.RequestTD),
    async ({ body }: VtsEx.ReqBody<PostRegister.Request>, res, next) => {
        try {
            if (await User.findOne({ login: body.login }).count().exec()) {
                const failJsonres: PostRegister.Response.Failure = {
                    failure: `user with login '${body.login}' already exists`
                };
                return res.status(PostRegister.Response.FailureStatus)
                          .json(failJsonres);
            }
            const newUser = await User.create({
                login:    body.login,
                password: Config.encodePassword(body.password),
                avaUrl:   body.avaUrl,
                fullname: body.fullname,
                role:     Config.DefaultRegisteredUserRole
            });
            const jsonres: PostRegister.Response.Success = {
                jwt:  newUser.makeJwt()
            };
            return res.json(jsonres);
        } catch (err) {
            return next(err);
        }
    }
);
// .get(Logout.$, ??)

