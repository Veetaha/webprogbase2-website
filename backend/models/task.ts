import * as Mongoose  from 'mongoose';
import * as Paginate  from 'mongoose-paginate';
import * as Vts       from 'vee-type-safe';

import * as Debug     from '@modules/debug';
import * as Helpers   from '@modules/apollo-helpers';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as ApiV1     from '@public-api/v1';
import { User }       from '@models/user';
import { Course }     from '@models/course';
import { TaskResult, TaskResultModel } from '@models/task-result';
import { getPopulated, get_id, set_id } from '@modules/common';


import ApiTask = ApiV1.Data.Task;
export import TaskType = GqlV1.TaskType;

import ObjectId = Mongoose.Types.ObjectId;

export interface TaskData {
    // id:                ObjectId;
    taskType:          TaskType;
    courseId:          ObjectId;
    authorId:          ObjectId;
    title:             string;
    body:              string;
    maxMark:           number;
    publicationDate:   Date;
    attachedFileUrl?:  Helpers.Maybe<string>;
}

const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    authorId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    taskType:         {
        type: String,
        required: true,
        enum: Object.values(TaskType)
    },
    title:            { type: String, required: true },
    body:             { type: String, required: true },
    maxMark:          { type: Number, required: true, min: 0 },
    publicationDate:  { type: Date,   required: true, default: Date.now  },
    attachedFileUrl:  { type: String, required: false }
});

Schema.virtual('id').get(get_id).set(set_id);

const Statics: TaskStatics = {
    updateTask: async ({ id, patch }) => ({
        task: await Helpers.tryUpdateById(Task, id, Helpers.filterNilProps(patch))
    }),

    deleteTask: async ({ id }) => ({ task: await Helpers.tryDeleteById(Task, id) }),
    getTask:    async ({ id }) => ({ task: await Helpers.tryFindById(Task, id)   }),

    isTaskType: Vts.isInEnum(TaskType)
};
const Methods: TaskMethods = {
    myTaskResult(me) {
        return TaskResult.findOne({ taskId: this._id, authorId: me.id }).exec();
    },
    author: getPopulated<Task>('authorId'),
    course: getPopulated<Task>('courseId'),
    getLocalTaskResults(req) {
        return Helpers.paginate<TaskResult, TaskResultModel>({
            ...req,
            model: TaskResult,
            sort: { lastUpdate: 'asc' },
            __filter: {
                taskId: this._id
            }
        });
    },


    // deprecated
    toCoreJsonData() {
        return {
            id:       String(this._id),
            maxMark:  this.maxMark,
            taskType: this.taskType,
            title:    this.title
        };
    },
    async toBasicJsonData() {
        return {
            ...this.toCoreJsonData(),
            author: (await this.author()).toBasicJsonData(),
        };
    },
    async toJsonData() {
        return {
            ...this.toCoreJsonData(),
            author: (await this.author()).toJsonData(),
            attachedFileUrl: this.attachedFileUrl,
            body:            this.body,
            courseId:        String(this.courseId)
        };
    }
};

Schema.statics = Statics;
Schema.methods = Methods;

Schema.pre('remove', async function(this: Task, next) {
    try {
        void await TaskResult.where('taskId').equals(this._id).remove().exec();
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});

Schema.plugin(Paginate);
export const Task = Mongoose.model<Task, TaskModel>('Task', Schema);

export interface TaskMethods {
    author(this: Task): Promise<User>;
    course(this: Task): Promise<Course>;
    myTaskResult(this: Task, me: User): Promise<TaskResult | null>;
    
    getLocalTaskResults(
          this: Task, 
          req: GqlV1.GetLocalTaskResultsRequest
    ): Promise<GqlV1.GetLocalTaskResultsResponse>; 


    // deprecated
    toCoreJsonData(this: Task):  ApiTask.CoreJson;
    toBasicJsonData(this: Task): Promise<ApiTask.BasicJson>;
    toJsonData(this: Task):      Promise<ApiTask.Json>;
}

export interface Task extends Mongoose.Document, TaskData, TaskMethods {}
export interface TaskStatics {
    updateTask(req: GqlV1.UpdateTaskRequest): Promise<GqlV1.UpdateTaskResponse>;
    deleteTask(req: GqlV1.DeleteTaskRequest): Promise<GqlV1.DeleteTaskResponse>;
    getTask(id: GqlV1.GetTaskRequest):        Promise<GqlV1.GetTaskResponse>;

    isTaskType(suspect: unknown): suspect is TaskType;

}
export interface TaskModel  extends Mongoose.PaginateModel<Task>, TaskStatics {}

