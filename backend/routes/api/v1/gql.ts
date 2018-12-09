import * as Express     from 'express';
import * as _           from 'lodash';
import * as Vts         from 'vee-type-safe';
import * as Apollo      from 'apollo-server-express';
import * as GqlV1       from '@declarations/gql-gen-v1';
import * as GqlV1Params from '@declarations/gql-params-v1';
import * as Config      from 'config';
import * as GqlIsoDate  from 'graphql-iso-date';
import {
    makeTypeMatcher,
    GqlBsonObjectId
} from '@modules/gql-types';
import { authenticate    } from '@modules/passport';
import { User            } from '@models/user';
import { Task            } from '@models/task';
import { Course          } from '@models/course';
import { Group           } from '@models/group';
import { TaskResult      } from '@models/task-result';
import {
    AllowGuardDirective,
    DenyGuardDirective
} from '@modules/apollo-helpers';

const QueryResolvers: GqlV1.QueryResolvers.Resolvers = {
    me: (_p, _args, { user }) => user!,
    getUser: async (_p, { req }, { user }) => (
        user && user._id.equals(req.id) ? { user } : User.getUser(req)
    ),
    getUsers:       (_p, { req }) => User.      getUsers(req),
    getCourses:     (_p, { req }) => Course.    getCourses(req),
    getGroups:      (_p, { req }) => Group.     getGroups(req),
    getTaskResults: (_p, { req }) => TaskResult.getTaskResults(req),
    
    getTask:           (_p, { req })           => Task.      getTask(req),
    getCourse:         (_p, { req })           => Course.    getCourse(req),
    getGroup:          (_p, { req })           => Group.     getGroup(req),
    getTaskResult:     (_p, { req })           => TaskResult.getTaskResult(req),
    getUserTaskResult: (_p, { req })           => TaskResult.getUserTaskResult(req),
    canSolveTask:      (_p, { req }, { user }) => TaskResult.canSolveTask(req, user!)
    
};
const UserResolvers: GqlV1.UserResolvers.Resolvers = {
    avaUrl: user => user.avaUrl || Config.DefaultUserAvatarUrl,
    group:  user => user.group()
};

const TaskResolvers: GqlV1.TaskResolvers.Resolvers = {
    author: task => task.author(),
    course: task => task.course(),
    myTaskResult: (task, {}, { user }) => task.myTaskResult(user!),
    getLocalTaskResults: (task, { req }) => task.getLocalTaskResults(req)
};
const CourseResolvers: GqlV1.CourseResolvers.Resolvers = {
    author:    course           => course.author(),
    getTasks: (course, { req }) => course.getTasks(req)
};

const GroupResolvers: GqlV1.GroupResolvers.Resolvers = {
    getCourses: (group, { req }) => group.getCourses(req),
    getMembers: (group, { req }) => group.getMembers(req)
};

const TaskResultResolvers: GqlV1.TaskResultResolvers.Resolvers = {
    author: taskResult => taskResult.author(),
    task:   taskResult => taskResult.task()
};

const TaskResultCheckResolvers: GqlV1.TaskResultCheckResolvers.Resolvers = {
    author: check => check.author()
};

const MutationResolvers: GqlV1.MutationResolvers.Resolvers = {
    createCourse: async (_p, { req }, { user }) => ({
        course: await Course.create({ ...req, authorId: user!._id })
    }),
    createTask: async (_p, { req }, { user }) => ({
        task: await Task.create({ ...req, authorId: user!._id })
    }),
    createGroup:  async (_p, { req }) => Group.createGroup(req),
    createTaskResult: async(_p, { req }, { user }) => (
        TaskResult.createTaskResult(req, user!)
    ),


    deleteTaskResult: (_p, { req }) => TaskResult.deleteTaskResult(req),    
    deleteCourse:     (_p, { req }) => Course.deleteCourse(req),
    deleteTask:       (_p, { req }) => Task.  deleteTask(req),
    deleteGroup:      (_p, { req }) => Group. deleteGroup(req),
    // deleteUser:    (_p, { req }) => User.  deleteUser(req),

    updateTaskResult: (_p, { req }, { user }) => TaskResult.updateTaskResult(req, user!),
    updateCourse: (_p, { req }) => Course.updateCourse(req),
    updateTask:   (_p, { req }) => Task.  updateTask(req),
    updateUser:   (_p, { req }) => User.  updateUser(req),
    updateGroup:  (_p, { req }) => Group. updateGroup(req),
    
    updateMe: (_p, { req }, { user }) => user!.updateMe(req),

    createTaskResultCheck: async (_p, { req }, { user }) => (await TaskResult
        .getTaskResult(req))
        .taskResult.createCheck(req, user!.id),

    updateTaskResultCheck: async (_p, { req: { id, patch } }) => (await TaskResult
        .getTaskResult({ id }))
        .taskResult.updateCheck(patch),

    deleteTaskResultCheck: async (_p, { req: { id } }) => (await TaskResult
        .getTaskResult({ id }))
        .taskResult.deleteCheck()
};

export const apolloServer = new Apollo.ApolloServer({
    playground: true,
    typeDefs: Apollo.gql(Config.GqlSchema),
    resolvers: {
        Mutation:         MutationResolvers        as Apollo.IResolverObject,
        Query:            QueryResolvers           as Apollo.IResolverObject,
        User:             UserResolvers            as Apollo.IResolverObject,
        Task:             TaskResolvers            as Apollo.IResolverObject,
        Course:           CourseResolvers          as Apollo.IResolverObject,
        Group:            GroupResolvers           as Apollo.IResolverObject,
        TaskResult:       TaskResultResolvers      as Apollo.IResolverObject,
        TaskResultCheck:  TaskResultCheckResolvers as Apollo.IResolverObject,
        BOID:        GqlBsonObjectId,
        Date:        GqlIsoDate.GraphQLDateTime
    },
    schemaDirectives: {
        deny:                 DenyGuardDirective,
        allow:                AllowGuardDirective,
        notEmpty:             makeTypeMatcher(/\S/),
        positiveInt:          makeTypeMatcher(Vts.isPositiveInteger),
        zeroOrPositiveInt:    makeTypeMatcher(Vts.isZeroOrPositiveInteger),
        zeroOrPositiveNumber: makeTypeMatcher(Vts.isZeroOrPositiveNumber),
        login:                makeTypeMatcher(/^[A-Za-z\d_-]{4,32}$/),
        password:             makeTypeMatcher(/^\S{6,32}$/),
        userFullname:         makeTypeMatcher(/^\S{3,32}$/)
    },
    context: async (
        args: { req: Express.Request, res: Express.Response }
    ): Promise<GqlV1Params.ResolveContext> => ({
        user: await authenticate(args.req)
    })
});

