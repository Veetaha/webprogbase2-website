"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
