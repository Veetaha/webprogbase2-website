import * as Mongoose  from 'mongoose';
// import * as Debug     from '@modules/debug';
import * as Paginate  from 'mongoose-paginate';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Helpers   from '@modules/apollo-helpers';
import * as _         from 'lodash';
import * as Apollo    from 'apollo-server-express';
import { getPopulated } from '@modules/common';
import { User   } from '@models/user';
import { Task   } from '@models/task';
import { Group  } from '@models/group';
import { Course } from '@models/course';
// import escapeStringRegexp = require('escape-string-regexp');



import ObjectId   = Mongoose.Types.ObjectId;
import { get_id, set_id } from '@modules/common';

export interface TaskCheckData {    
    authorId:   ObjectId;
    lastUpdate: Date;
    comment?:   Helpers.Maybe<string>;
    score:      number;    
}

export interface TaskResultData {
    authorId:    ObjectId;
    taskId:      ObjectId;
    lastUpdate:  Date;

    body?:       Helpers.Maybe<string>;
    fileUrl?:    Helpers.Maybe<string>;

    check?:      TaskCheck;
}

const TypeCheckSchema = new Mongoose.Schema({
            authorId:  {
                type: [Mongoose.SchemaTypes.ObjectId],
                ref:  'User',
                required: true
            },  
            lastUpdate: { type: Date,   required: true, default: Date.now },
            comment:    { type: String, required: false },
            score:      { type: Number, required: true  }
        });

const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    authorId:  {
        type: [Mongoose.SchemaTypes.ObjectId],
        ref:  'User',
        required: true
    },
    taskId:  {
        type: [Mongoose.SchemaTypes.ObjectId],
        ref:  'Task',
        required: true
    },
    lastUpdate: { type: Date,   required: true, default: Date.now },
    body:       { type: String, required: false },
    fileUrl:    { type: Date,   required: false },
    check: { 
        type: TypeCheckSchema,
        required: false
    }
});

Schema.virtual('id').get(get_id).set(set_id);

const Statics: TaskResultStatics = {
    getTaskResults({page, limit, search}) {
        return TaskResult.aggregate([
            { 
                $lookup: { 
                    from:       Task.collection.name, 
                    localField: 'taskId', 
                    foreignField: '_id', 
                    as: '_task'  
                }  
            }, 
            { $unwind: '$_task' }, 
            { 
                $match: Helpers.mapStringValuesToSearchRegexp(
                    Helpers.renameKey(search, 'taskTitle', 'title')
                ) 
            },
            { $sort: { '_task.name': 1 } },
            { 
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    data:  { $push: '$$ROOT' }
                }
            },
            { $project: {  total: 1, results: { $skip: (page - 1) * limit }}},
            { $project: {  total: 1, results: { $limit: limit }}}
        ]).exec();
    },

    getUserTaskResult: async req => ({ 
        taskResult: await Helpers.tryFindOne(TaskResult, req)
    }),

    getTaskResult: async ({ id }) => ({ 
        taskResult: await Helpers.tryFindById(TaskResult, id) 
    }),

    createTaskResult: async (req, authorId) => ({
        taskResult: await TaskResult.create({ ...req, authorId })
    }),

    updateTaskResult: async ({ id, patch }) => ({ 
        taskResult: await Helpers.tryUpdateById(TaskResult, id, {
            ...patch, lastUpdate: new Date
        })
    }),

    deleteTaskResult: async ({ id }) => ({ 
        taskResult: await Helpers.tryDeleteById(TaskResult, id) 
    }),
    async ensureUserCanSolveTask(user, taskId) {
        if (!user.groupId) {
            throw new Apollo.ForbiddenError(`only group members can solve tasks`);
        }
        const [group, { task }] = await Promise.all([
            user.group(), 
            Task.getTask({ id: taskId })
        ]);
        if (!group.coursesId.includes(task.courseId)) {
            throw new Apollo.ForbiddenError(`your group has no access to the course`);
        }
    }
};

const Methods: TaskResultMethods = {
    author: getPopulated<TaskResult>('authorId'),
    task:   getPopulated<TaskResult>('taskId'),
    async createCheck(req, authorId) {
        this.check = { authorId, ...req.payload } as any;
        debugger;
        return {
            taskResult: await this.save()
        };
    },
    async updateCheck(req) {
        if (!this.check) {
            throw new Apollo.ApolloError(
                `Can't update task result check as it doesn't exits`
            );
        }
        await this.check.update(req.patch).exec();
        return  {
            taskResult: await this.save()
        }
    },
    async deleteCheck() {
        if (!this.check) {
            throw new Apollo.ApolloError(
                `Can't delete task result check as it doesn't exits`
            );
        }
        await this.check.remove();
        debugger;
        return {
            taskResult: await this.save()
        };
    }

    /*
    getCourses(req) {
        return Helpers.paginate<Course, CourseModel>({
            ...req,
            model: Course,
            sort:   { publicationDate: 'desc' },
            filter: { include: { id: this.coursesId }}
        });
    },

    async getMembers(req) {
        return Helpers.paginate<User, UserModel>({
            ...req,
            model: User,
            sort:   { login: 'asc' },
            filter: { include: { groupId: this._id }}
        });
    }*/
};
Schema.methods = Methods;
Schema.statics = Statics;




Schema.plugin(Paginate);
// Schema.plugin(UniqueArrayPlugin);
export const TaskResult = Mongoose.model<TaskResult, TaskResultModel>('TaskResult', Schema);

export interface TaskResultStatics {

    getTaskResults(  
          req: GqlV1.GetTaskResultsRequest
    ): Promise<GqlV1.GetTaskResultsResponse>;

    getTaskResult(
          req: GqlV1.GetTaskResultRequest
    ): Promise<GqlV1.GetTaskResultResponse>;

    getUserTaskResult(
        req: GqlV1.GetUserTaskResultRequest
    ): Promise<GqlV1.GetUserTaskResultResponse>;

    createTaskResult(
          req: GqlV1.CreateTaskResultRequest,
          authorId: ObjectId
    ): Promise<GqlV1.CreateTaskResultResponse>;

    updateTaskResult(
          req: GqlV1.UpdateTaskResultRequest
    ): Promise<GqlV1.UpdateTaskResultResponse>;

    deleteTaskResult(
          req: GqlV1.DeleteTaskResultRequest
    ): Promise<GqlV1.DeleteTaskResultResponse>;

    ensureUserCanSolveTask(user: User, taskId: ObjectId): Promise<void>;
}

export interface TaskResultModel 
extends Mongoose.PaginateModel<TaskResult, TaskResultData>, TaskResultStatics {}

export interface TaskResultMethods {
    author(): Promise<User>;
    task(): Promise<Task>;
    createCheck(
          this: TaskResult,
          req:  GqlV1.CreateTaskResultCheckRequest,
          authorId: ObjectId
    ): Promise<GqlV1.CreateTaskResultCheckResponse>;

    updateCheck(
          this: TaskResult,
          req:  GqlV1.UpdateTaskResultCheckRequest
    ): Promise<GqlV1.UpdateTaskResultCheckResponse>;

    deleteCheck(
          this: TaskResult
    ): Promise<GqlV1.DeleteTaskResultCheckResponse>;
}

export interface TaskResult 
extends Mongoose.Document, TaskResultData, TaskResultMethods {}

export interface TaskCheck extends Mongoose.Document, TaskCheckData {}