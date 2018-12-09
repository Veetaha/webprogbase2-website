import * as Mongoose  from 'mongoose';
// import * as Debug     from '@modules/debug';
import * as Paginate  from 'mongoose-paginate';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Helpers   from '@modules/apollo-helpers';
import * as _         from 'lodash';
import * as Apollo    from 'apollo-server-express';
import * as Vts       from 'vee-type-safe';
import { getPopulated } from '@modules/common';
import { User   } from '@models/user';
import { Task   } from '@models/task';
// import { Group  } from '@models/group';
// import { Course } from '@models/course';
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

    check?:      Helpers.Maybe<TaskResultCheck>;
}

const TaskResultCheckSchema = new Mongoose.Schema({
    authorId:  {
        type: Mongoose.SchemaTypes.ObjectId,
        ref:  'User',
        required: true
    },  
    lastUpdate: { type: Date,   required: true, default: Date.now },
    comment:    { type: String, required: false },
    score:      { type: Number, required: true  }
});

const TaskResultCheckMethods: TaskResultCheckMethods = {
    author: getPopulated('authorId')
};

TaskResultCheckSchema.methods = TaskResultCheckMethods;

const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    authorId:  {
        type: Mongoose.SchemaTypes.ObjectId,
        ref:  'User',
        required: true
    },
    taskId:  {
        type: Mongoose.SchemaTypes.ObjectId,
        ref:  'Task',
        required: true
    },
    lastUpdate: { type: Date,   required: true, default: Date.now },
    body:       { type: String, required: false },
    fileUrl:    { type: String, required: false },
    check: { 
        type: TaskResultCheckSchema,
        required: false
    }
});

Schema.virtual('id').get(get_id).set(set_id);

const Statics: TaskResultStatics = {
    async getTaskResults({page, limit, search}) {
        type AggregationRetVal = { 
            data: Vts.BasicObject[], 
            total: number 
        };
        const [ result ]: [AggregationRetVal] = await TaskResult.aggregate([
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
                $facet: {
                    data:  [ { $skip: (page - 1) * limit }, { $limit: limit } ],
                    total: [ { $count: '_count' } ]
                }
            },
            { $project: { data: 1, total: '$total._count' } }
        ]).exec();
        result.data = result.data.map(obj => new TaskResult(obj));
        return result as GqlV1.GetTaskResultsResponse;
    },

    getUserTaskResult: async req => ({ 
        taskResult: await Helpers.tryFindOne(TaskResult, req)
    }),

    getTaskResult: async ({ id }) => ({ 
        taskResult: await Helpers.tryFindById(TaskResult, id) 
    }),

    async createTaskResult(req, user) {
        void await TaskResult.ensureUserCanCreateTaskResult(user, req.taskId);
        return {
            taskResult: await TaskResult.create({ ...req, authorId: user.id })
        };
    },

    async updateTaskResult({ id, patch }, user) {
        const { taskResult } = await TaskResult.getTaskResult({ id });

        TaskResult.ensureUserCanUpdateTaskResult(user, taskResult);
        return {
            taskResult: await Helpers.tryUpdateById(
                TaskResult, id, { ...patch, lastUpdate: new Date }
            ) 
        };
    },

    deleteTaskResult: async ({ id }) => ({ 
        taskResult: await Helpers.tryDeleteById(TaskResult, id) 
    }),
    async hasUserCreatedTaskResult(authorId, taskId) {
        return !!await TaskResult.findOne({ authorId, taskId });
    },
    async ensureUserHasntCreatedTaskResult(authorId, taskId) {
        if (await TaskResult.hasUserCreatedTaskResult(taskId, authorId)) {
            throw new Apollo.ValidationError(`user has already submitted a result for this task`);
        }
    },
    async ensureUserCanCreateTaskResult(user, taskId) {
        user.ensureHasGroup();
        void await TaskResult.ensureUserHasntCreatedTaskResult(user.id, taskId);
        if (!(await TaskResult.canSolveTask({ id: taskId }, user)).answer){
            throw new Apollo.ForbiddenError(`user group has no access to the course`);
        }
    },
    ensureUserCanUpdateTaskResult(user, taskResult) {
        if (!taskResult.authorId.equals(user.id)) {
            throw new Apollo.ForbiddenError('user has no access to updating this task result');
        }
    },
    async canSolveTask(req, user) {
        if (!user.groupId) {
            return { answer: false };
        }
        const [group, { task }] = await Promise.all([
            user.group(), 
            Task.getTask({ id: req.id })
        ]);
        return { answer: !!group.coursesId.find(courseId => courseId.equals(task.courseId)) };
    }
};

const Methods: TaskResultMethods = {
    author: getPopulated<TaskResult>('authorId'),
    task:   getPopulated<TaskResult>('taskId'),
    async createCheck(req, authorId) {
        if (this.check) {
            throw new Apollo.ValidationError('task was already checked');
        }
        this.check = { ...req.payload, authorId } as any;
        return {
            taskResult: await this.save()
        };
    },
    async updateCheck(patch) {
        if (!this.check) {
            throw new Apollo.ApolloError(
                `Can't update task result check as it doesn't exits`
            );
        }
        return {                                
            taskResult: await Helpers.tryUpdateById(TaskResult, this.id, { check: { ...patch, lastUpdate: new Date } })
        };
    },
    async deleteCheck() {
        if (!this.check) {
            throw new Apollo.ApolloError(
                `Can't delete task result check as it doesn't exits`
            );
        }
        this.check = null;
        return {
            taskResult: await this.save()
        };
    }

};
Schema.methods = Methods;
Schema.statics = Statics;




Schema.plugin(Paginate);
// Schema.plugin(UniqueArrayPlugin);
export const TaskResult = Mongoose.model<TaskResult, TaskResultModel>('TaskResult', Schema);

export interface TaskResultStatics {
    hasUserCreatedTaskResult(userId: ObjectId, taskId: ObjectId): Promise<boolean>;

    canSolveTask(
        req: GqlV1.CanSolveTaskRequest,
        user: User
    ): Promise<GqlV1.CanSolveTaskResponse>;

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
          user: User
    ): Promise<GqlV1.CreateTaskResultResponse>;

    updateTaskResult(
          req: GqlV1.UpdateTaskResultRequest,
          user: User
    ): Promise<GqlV1.UpdateTaskResultResponse>;

    deleteTaskResult(
          req: GqlV1.DeleteTaskResultRequest
    ): Promise<GqlV1.DeleteTaskResultResponse>;
    ensureUserHasntCreatedTaskResult(userId: ObjectId, taskId: ObjectId): Promise<void>;
    ensureUserCanCreateTaskResult(user: User, taskId: ObjectId): Promise<void>;
    ensureUserCanUpdateTaskResult(user: User, taskResult: TaskResult): void;
}

export interface TaskResultModel 
extends Mongoose.PaginateModel<TaskResult>, TaskResultStatics {}

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
          req:  GqlV1.UpdateTaskResultCheckPatch
    ): Promise<GqlV1.UpdateTaskResultCheckResponse>;

    deleteCheck(
          this: TaskResult
    ): Promise<GqlV1.DeleteTaskResultCheckResponse>;
}

export interface TaskResult 
extends Mongoose.Document, TaskResultData, TaskResultMethods {}

export interface TaskResultCheck extends Mongoose.Document, TaskCheckData, TaskResultCheckMethods {}
export interface TaskResultCheckMethods {
    author(this: TaskResultCheck): Promise<User>;
}