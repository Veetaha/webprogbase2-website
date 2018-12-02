import * as Express     from 'express';
import * as _           from 'lodash';
import * as Vts         from 'vee-type-safe';
import * as Debug       from '@modules/debug';
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
import {
    tryDeleteById,
    tryFindById,
    tryUpdateById,
    AllowGuardDirective,
    DenyGuardDirective,
    filterNilProps
} from '@modules/apollo-helpers';

const QueryResolvers: GqlV1.QueryResolvers.Resolvers = {
    me(_p, _args, { user }) {
        Debug.assert(user);
        if (!user) {
            throw new Apollo.AuthenticationError('unauthorized');
        }
        return user;
    },
    getUser(_p, { req }, { user }) {
        return user && user._id.equals(req.id) ? user : User.getUser(req);
    },
    getUsers:   (_p, { req }) => User.getUsers(req),
    getCourses: (_p, { req }) => Course.getCourses(req),
    getTask:    (_p, { req }) => Task.getTask(req),
    getCourse:  (_p, { req }) => Course.getCourse(req)
};
const UserResolvers: GqlV1.UserResolvers.Resolvers = {
    avaUrl: user => user.avaUrl || Config.DefaultUserAvatarUrl
};

const TaskResolvers: GqlV1.TaskResolvers.Resolvers = {
    author: task => task.author(),
    course: task => task.course()
};
const CourseResolvers: GqlV1.CourseResolvers.Resolvers = {
    author:    course           => course.author(),
    getTasks: (course, { req }) => course.getTasks(req)
};

const MutationResolvers: GqlV1.MutationResolvers.Resolvers = {
    createCourse: async (_p, { req }, { user }) => {
        Debug.assert(user);
        return Course.create({authorId: user!._id, ...req})
              .then(course => ({ course }));
    },
    createTask: async (_p, { req }, { user }) => {
        Debug.assert(user);
        return {
            task: await Task.create({
                ...req,
                courseId: req.courseId,
                authorId: user!._id
            })
        };
    },
    deleteCourse: (_p, { req }) => tryDeleteById(Course, req.id).then(course => ({ course })),
    deleteTask:   (_p, { req }) => tryDeleteById(Task,   req.id).then(task   => ({ task   })),
    deleteUser:   (_p, { req }) => tryDeleteById(User,   req.id).then(user   => ({ user   })),
    updateCourse: (_p, { req }) => tryUpdateById(Course, req.id, filterNilProps(req.patch))
                                    .then(course => ({ course })),
    updateTask:   (_p, { req }) => tryUpdateById(Task,   req.id, filterNilProps(req.patch))
                                    .then(task   => ({ task })),
    updateUser:   (_p, { req }) => tryUpdateById(User,   req.id, filterNilProps(req.patch))
                                    .then(user   => ({ user })),
    
    updateMe: async (_p, { req }, { user }) => {
        Debug.assert(user);
        return {
            me: await Object.assign(user, _.omitBy(req.patch, (val, key) => (
                    key === 'avaUrl' ? val === undefined : _.isNil(val)
            ))).save()
        };
    }
};

export const apolloServer = new Apollo.ApolloServer({
    typeDefs: Apollo.gql(Config.GqlSchema),
    resolvers: {
        Mutation:    MutationResolvers as Apollo.IResolverObject,
        Query:       QueryResolvers    as Apollo.IResolverObject,
        User:        UserResolvers     as Apollo.IResolverObject,
        Task:        TaskResolvers     as Apollo.IResolverObject,
        Course:      CourseResolvers   as Apollo.IResolverObject,
        BOID:        GqlBsonObjectId,
        Date:        GqlIsoDate.GraphQLDateTime
    },
    playground: true,
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

