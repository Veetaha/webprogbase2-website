import * as mongoose  from 'mongoose';
import * as Paginate  from 'mongoose-paginate';
import * as Vts       from 'vee-type-safe';

import * as Helpers from '@modules/apollo-helpers';
import * as GqlV1   from '@declarations/gql-gen-v1';
import * as ApiV1   from '@public-api/v1';
import { User }     from '@models/user';
import { Course }   from '@models/course';
import { getPopulated, get_id } from '@modules/common';

import ApiTask = ApiV1.Data.Task;
export import TaskType = ApiTask.Type;

import ObjectId = mongoose.Types.ObjectId;

export interface TaskData {
    id:                ObjectId;
    taskType:          TaskType;
    courseId:          ObjectId;
    authorId:          ObjectId;
    title:             string;
    body:              string;
    maxMark:           number;
    publicationDate:   Date;
    attachedFileUrl?:  string | null;
}

const Schema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
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
    publicationDate:  { type: Date,   default: Date.now  },
    attachedFileUrl:  { type: String, required: false }
});

Schema.virtual('id').get(get_id);

Schema.statics = {
    updateTask: async ({ id, patch }) => ({
        task: await Helpers.tryUpdateById(Task, id, Helpers.filterNilProps(patch))
    }),

    deleteTask: async ({ id }) => ({ task: await Helpers.tryDeleteById(Task, id) }),
    getTask:    async ({ id }) => ({ task: await Helpers.tryFindById(Task, id)   }),

    isTaskType: Vts.isInEnum(TaskType)
} as TaskModel;
Schema.methods = {
    author: getPopulated<Task>('authorId'),
    course: getPopulated<Task>('courseId'),
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
} as Task;

Schema.plugin(Paginate);
export const Task = mongoose.model<Task, TaskModel>('Task', Schema);

export interface Task extends mongoose.Document, TaskData {
    author():          Promise<User>;
    course():          Promise<Course>;
    
    toCoreJsonData():  ApiTask.CoreJson;
    toBasicJsonData(): Promise<ApiTask.BasicJson>;
    toJsonData():      Promise<ApiTask.Json>;
}
export interface TaskModel  extends mongoose.PaginateModel<Task, TaskData> {
    updateTask(req: GqlV1.UpdateTaskRequest): Promise<GqlV1.UpdateTaskResponse>;
    deleteTask(req: GqlV1.DeleteTaskRequest): Promise<GqlV1.DeleteTaskResponse>;
    getTask(id: GqlV1.GetTaskRequest):        Promise<GqlV1.GetTaskResponse>;

    isTaskType(suspect: unknown): suspect is TaskType;
}

