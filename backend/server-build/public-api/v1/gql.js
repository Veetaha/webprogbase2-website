"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./gql-extras"));
/** Represents an academic task type, currently it has no special meaning. */
var TaskType;
(function (TaskType) {
    TaskType["Homework"] = "homework";
    TaskType["Lab"] = "lab";
    TaskType["Test"] = "test";
    TaskType["Exam"] = "exam";
})(TaskType = exports.TaskType || (exports.TaskType = {}));
/** User role limits access for some resources.See @deny and @access directives for each endpoint.By default, if no such directive is applied, the endpoint is freely accessible. */
var UserRole;
(function (UserRole) {
    UserRole["Guest"] = "guest";
    UserRole["Student"] = "student";
    UserRole["Teacher"] = "teacher";
    UserRole["Admin"] = "admin";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var Access;
(function (Access) {
    // tslint:disable:no-shadowed-variable
    Access.Query = {
        me: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getTaskResults: new Set([UserRole.Teacher, UserRole.Admin]),
        getTaskResult: new Set([
            UserRole.Student,
            UserRole.Teacher,
            UserRole.Admin
        ]),
        getUserTaskResult: new Set([
            UserRole.Student,
            UserRole.Teacher,
            UserRole.Admin
        ]),
        getUsers: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getGroups: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getUser: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getTask: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getGroup: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        canSolveTask: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin])
    };
    Access.Group = {
        $: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin])
    };
    Access.Task = {
        myTaskResult: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        getLocalTaskResults: new Set([UserRole.Teacher, UserRole.Admin])
    };
    Access.Mutation = {
        createTask: new Set([UserRole.Teacher, UserRole.Admin]),
        createCourse: new Set([UserRole.Teacher, UserRole.Admin]),
        createGroup: new Set([UserRole.Admin]),
        updateGroup: new Set([UserRole.Admin]),
        deleteGroup: new Set([UserRole.Admin]),
        updateMe: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
        updateUser: new Set([UserRole.Admin]),
        updateTask: new Set([UserRole.Teacher, UserRole.Admin]),
        updateCourse: new Set([UserRole.Teacher, UserRole.Admin]),
        deleteTask: new Set([UserRole.Teacher, UserRole.Admin]),
        deleteCourse: new Set([UserRole.Teacher, UserRole.Admin]),
        createTaskResult: new Set([UserRole.Student, UserRole.Admin]),
        updateTaskResult: new Set([UserRole.Student, UserRole.Admin]),
        deleteTaskResult: new Set([UserRole.Admin]),
        createTaskResultCheck: new Set([UserRole.Teacher, UserRole.Admin]),
        updateTaskResultCheck: new Set([UserRole.Teacher, UserRole.Admin]),
        deleteTaskResultCheck: new Set([UserRole.Admin])
    };
    // tslint:enable:no-shadowed-variable
})(Access = exports.Access || (exports.Access = {}));
