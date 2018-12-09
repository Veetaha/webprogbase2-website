'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express = require('express');
const passport = require('passport');
const VtsEx = require('vee-type-safe/express');
const Config = require('../config');
const ApiV1 = require('../public-api/v1/index');
const user_1 = require('../models/user');
// import { ensureUserCanAccess } from '@modules/passport';
var Route = ApiV1.Routes.Auth;
var PostLogin = Route.Login.Post;
var PostRegister = Route.Register.Post;
exports.router = express.Router().post(PostLogin.$, (req, res, next) => {
    passport.authenticate('local', { session: false }, (authError, user, info) => {
        if (authError) {
            return next(authError);
        }
        if (!user) {
            const failJsonres = { failure: info && info.message || 'undefined behaviour at Login.Post' };
            return res.status(PostLogin.Response.FailureStatus).json(failJsonres);
        }
        const jsonres = { jwt: user.makeJwt() };
        return res.json(jsonres);
    })(req, res);
}).post(PostRegister.$, VtsEx.ensureTypeMatch(VtsEx.ReqBody, PostRegister.RequestTD), async ({body}, res, next) => {
    try {
        if (await user_1.User.findOne({ login: body.login }).count().exec()) {
            const failJsonres = { failure: `user with login '${ body.login }' already exists` };
            return res.status(PostRegister.Response.FailureStatus).json(failJsonres);
        }
        const newUser = await user_1.User.create({
            login: body.login,
            password: Config.encodePassword(body.password),
            avaUrl: body.avaUrl,
            fullname: body.fullname,
            role: Config.DefaultRegisteredUserRole
        });
        const jsonres = { jwt: newUser.makeJwt() };
        return res.json(jsonres);
    } catch (err) {
        return next(err);
    }
});    // .get(Logout.$, ??)
