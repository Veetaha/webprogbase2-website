'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Vts = require('vee-type-safe');
const Apollo = require('apollo-server-express');
const Config = require('../../../config');
const GqlIsoDate = require('graphql-iso-date');
const gql_types_1 = require('../../../modules/gql-types');
const passport_1 = require('../../../modules/passport');
const user_1 = require('../../../models/user');
const task_1 = require('../../../models/task');
const course_1 = require('../../../models/course');
const group_1 = require('../../../models/group');
const task_result_1 = require('../../../models/task-result');
const apollo_helpers_1 = require('../../../modules/apollo-helpers');
const QueryResolvers = {
    me: (_p, _args, {user}) => user,
    getUser: async (_p, {req}, {user}) => user && user._id.equals(req.id) ? { user } : user_1.User.getUser(req),
    getUsers: (_p, {req}) => user_1.User.getUsers(req),
    getCourses: (_p, {req}) => course_1.Course.getCourses(req),
    getGroups: (_p, {req}) => group_1.Group.getGroups(req),
    getTaskResults: (_p, {req}) => task_result_1.TaskResult.getTaskResults(req),
    getTask: (_p, {req}) => task_1.Task.getTask(req),
    getCourse: (_p, {req}) => course_1.Course.getCourse(req),
    getGroup: (_p, {req}) => group_1.Group.getGroup(req),
    getTaskResult: (_p, {req}) => task_result_1.TaskResult.getTaskResult(req),
    getUserTaskResult: (_p, {req}) => task_result_1.TaskResult.getUserTaskResult(req),
    canSolveTask: (_p, {req}, {user}) => task_result_1.TaskResult.canSolveTask(req, user)
};
const UserResolvers = {
    avaUrl: user => user.avaUrl || Config.DefaultUserAvatarUrl,
    group: user => user.group()
};
const TaskResolvers = {
    author: task => task.author(),
    course: task => task.course(),
    myTaskResult: (task, {}, {user}) => task.myTaskResult(user),
    getLocalTaskResults: (task, {req}) => task.getLocalTaskResults(req)
};
const CourseResolvers = {
    author: course => course.author(),
    getTasks: (course, {req}) => course.getTasks(req)
};
const GroupResolvers = {
    getCourses: (group, {req}) => group.getCourses(req),
    getMembers: (group, {req}) => group.getMembers(req)
};
const TaskResultResolvers = {
    author: taskResult => taskResult.author(),
    task: taskResult => taskResult.task()
};
const TaskResultCheckResolvers = { author: check => check.author() };
const MutationResolvers = {
    createCourse: async (_p, {req}, {user}) => ({ course: await course_1.Course.create(Object.assign({}, req, { authorId: user._id })) }),
    createTask: async (_p, {req}, {user}) => ({ task: await task_1.Task.create(Object.assign({}, req, { authorId: user._id })) }),
    createGroup: async (_p, {req}) => group_1.Group.createGroup(req),
    createTaskResult: async (_p, {req}, {user}) => task_result_1.TaskResult.createTaskResult(req, user),
    deleteTaskResult: (_p, {req}) => task_result_1.TaskResult.deleteTaskResult(req),
    deleteCourse: (_p, {req}) => course_1.Course.deleteCourse(req),
    deleteTask: (_p, {req}) => task_1.Task.deleteTask(req),
    deleteGroup: (_p, {req}) => group_1.Group.deleteGroup(req),
    // deleteUser:    (_p, { req }) => User.  deleteUser(req),
    updateTaskResult: (_p, {req}, {user}) => task_result_1.TaskResult.updateTaskResult(req, user),
    updateCourse: (_p, {req}) => course_1.Course.updateCourse(req),
    updateTask: (_p, {req}) => task_1.Task.updateTask(req),
    updateUser: (_p, {req}) => user_1.User.updateUser(req),
    updateGroup: (_p, {req}) => group_1.Group.updateGroup(req),
    updateMe: (_p, {req}, {user}) => user.updateMe(req),
    createTaskResultCheck: async (_p, {req}, {user}) => (await task_result_1.TaskResult.getTaskResult(req)).taskResult.createCheck(req, user.id),
    updateTaskResultCheck: async (_p, {
        req: {id, patch}
    }) => (await task_result_1.TaskResult.getTaskResult({ id })).taskResult.updateCheck(patch),
    deleteTaskResultCheck: async (_p, {
        req: {id}
    }) => (await task_result_1.TaskResult.getTaskResult({ id })).taskResult.deleteCheck()
};
exports.apolloServer = new Apollo.ApolloServer({
    playground: true,
    typeDefs: Apollo.gql(Config.GqlSchema),
    resolvers: {
        Mutation: MutationResolvers,
        Query: QueryResolvers,
        User: UserResolvers,
        Task: TaskResolvers,
        Course: CourseResolvers,
        Group: GroupResolvers,
        TaskResult: TaskResultResolvers,
        TaskResultCheck: TaskResultCheckResolvers,
        BOID: gql_types_1.GqlBsonObjectId,
        Date: GqlIsoDate.GraphQLDateTime
    },
    schemaDirectives: {
        deny: apollo_helpers_1.DenyGuardDirective,
        allow: apollo_helpers_1.AllowGuardDirective,
        notEmpty: gql_types_1.makeTypeMatcher(/\S/),
        positiveInt: gql_types_1.makeTypeMatcher(Vts.isPositiveInteger),
        zeroOrPositiveInt: gql_types_1.makeTypeMatcher(Vts.isZeroOrPositiveInteger),
        zeroOrPositiveNumber: gql_types_1.makeTypeMatcher(Vts.isZeroOrPositiveNumber),
        login: gql_types_1.makeTypeMatcher(/^[A-Za-z\d_-]{4,32}$/),
        password: gql_types_1.makeTypeMatcher(/^\S{6,32}$/),
        userFullname: gql_types_1.makeTypeMatcher(/^\S{3,32}$/)
    },
    context: async args => ({ user: await passport_1.authenticate(args.req) })
});