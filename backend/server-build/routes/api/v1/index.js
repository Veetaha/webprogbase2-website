'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express = require('express');
const VtsEx = require('vee-type-safe/express');
const HttpCodes = require('http-status-codes');
const ApiV1 = require('../../../public-api/v1/index');
const Debug = require('../../../modules/debug');
// import * as Mongoose  from 'mongoose';
// import ObjectId = Mongoose.Schema.Types.ObjectId;
const task_1 = require('../../../models/task');
const user_1 = require('../../../models/user');
const course_1 = require('../../../models/course');
const vee_express_middleware_1 = require('../../../modules/vee-express-middleware');
const common_1 = require('../../../modules/common');
const passport_1 = require('../../../modules/passport');
const error_1 = require('../../../modules/error');
var Route = ApiV1.Routes.Api.V1;
var GetMe = Route.Me.Get;
var PostCourse = Route.Course.Post;
var GetCourse = Route.Course.Get;
var GetCourses = Route.Courses.Get;
var PutCourse = Route.Course.Put;
var DeleteCourse = Route.Course.Delete;
var PostTask = Route.Task.Post;
var GetTask = Route.Task.Get;
var PutTask = Route.Task.Put;
var DeleteTask = Route.Task.Delete;
var GetUsers = Route.Users.Get;
var GetUser = Route.User.Get;
var PutUser = Route.User.Put;
var DeleteUser = Route.User.Delete;
function respondWithEmptyObject(_req, res) {
    res.json({});
}
function ensureBodyType(typeDescr) {
    return VtsEx.ensureTypeMatch(VtsEx.ReqBody, typeDescr);
}
exports.router = express.Router().get(GetMe.$, passport_1.ensureUserCanAccessRoute, (req, res) => {
    if (!req.user) {
        return Debug.shutdown();
    }
    const jsonres = req.user.toJsonData();
    return res.json(jsonres);
}).post(PostCourse.$, passport_1.ensureUserCanAccessRoute, ensureBodyType(PostCourse.RequestTD), async ({body, user}, res, next) => {
    try {
        const newCourse = await course_1.Course.create(Object.assign({ authorId: user._id }, body));
        const jsonres = { id: String(newCourse.id) };
        res.status(HttpCodes.CREATED).json(jsonres);
    } catch (err) {
        next(err);
    }
}).get(GetCourse.$(':id'), passport_1.ensureUserCanAccessRoute, common_1.getPagination, vee_express_middleware_1.getById({ model: course_1.Course }), async ({pagination, db}, res, next) => {
    const course = db.gotById;
    try {
        Debug.assert(pagination);
        const jsonres = await course.toJsonData(pagination);
        res.json(jsonres);
    } catch (err) {
        next(err);
    }
}).get(GetCourses.$, passport_1.ensureUserCanAccessRoute, common_1.getPagination, async ({pagination}, res, next) => {
    Debug.assert(pagination);
    try {
        const jsonres = await course_1.Course.getPageRest(pagination);
        res.json(jsonres);
    } catch (err) {
        next(err);
    }
}).put(PutCourse.$(':id'), passport_1.ensureUserCanAccessRoute, ensureBodyType(PutCourse.RequestTD), vee_express_middleware_1.updateById(course_1.Course), respondWithEmptyObject).delete(DeleteCourse.$(':id'), passport_1.ensureUserCanAccessRoute, vee_express_middleware_1.deleteById(course_1.Course), respondWithEmptyObject).post(PostTask.$(':id'), passport_1.ensureUserCanAccessRoute, ensureBodyType(PostTask.RequestTD), vee_express_middleware_1.getById({ model: course_1.Course }), async ({db, body, user}, res, next) => {
    try {
        const newTask = await new task_1.Task(Object.assign({
            courseId: db.gotById._id,
            authorId: user._id
        }, body)).save();
        const jsonResponse = { id: String(newTask._id) };
        res.status(HttpCodes.CREATED).json(jsonResponse);
    } catch (err) {
        next(err);
    }
}).get(GetTask.$(':id'), passport_1.ensureUserCanAccessRoute, vee_express_middleware_1.getById({ model: task_1.Task }), async (req, res) => res.json(await req.db.gotById.toJsonData())).put(PutTask.$(':id'), passport_1.ensureUserCanAccessRoute, ensureBodyType(PutTask.RequestTD), vee_express_middleware_1.updateById(task_1.Task), respondWithEmptyObject).delete(DeleteTask.$(':id'), passport_1.ensureUserCanAccessRoute, vee_express_middleware_1.getById({ model: task_1.Task }), vee_express_middleware_1.deleteById(task_1.Task), respondWithEmptyObject).get(GetUsers.$, passport_1.ensureUserCanAccessRoute, common_1.getPagination, async ({pagination}, res, next) => {
    Debug.assert(pagination);
    try {
        const jsonres = await user_1.User.getPageRest(pagination);
        res.json(jsonres);
    } catch (err) {
        next(err);
    }
}).get(GetUser.$(':id'), passport_1.ensureUserCanAccessRoute, vee_express_middleware_1.getById({ model: user_1.User }), (req, res) => {
    const jsonres = req.db.gotById.toJsonData();
    res.json(jsonres);
}).put(PutUser.$, passport_1.ensureUserCanAccessRoute, VtsEx.ensureTypeMatch(VtsEx.ReqBody, PutUser.RequestTD), async ({body, user}, res, next) => {
    if (!user.canPutUser(body)) {
        return next(error_1.forbidden());
    }
    try {
        if (!body.id) {
            void (await user.update(body).exec());
        } else {
            const id = body.id;
            delete body.id;
            void (await user_1.User.findByIdAndUpdate(id, body));
        }
        return res.json({});
    } catch (err) {
        next(err);
    }
}).delete(DeleteUser.$(':id'), passport_1.ensureUserCanAccessRoute, vee_express_middleware_1.deleteById(user_1.User), respondWithEmptyObject).use((err, _req, res, _next) => {
    const jsonError = { error: err.message };
    res.status(err.status || HttpCodes.INTERNAL_SERVER_ERROR).json(jsonError);
});