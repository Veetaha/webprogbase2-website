'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');
const Vts = require('vee-type-safe');
const Debug = require('../modules/debug');
const Helpers = require('../modules/apollo-helpers');
const GqlV1 = require('../declarations/gql-gen-v1');
const task_result_1 = require('./task-result');
const common_1 = require('../modules/common');
exports.TaskType = GqlV1.TaskType;
const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    },
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
    taskType: {
        type: String,
        required: true,
        enum: Object.values(exports.TaskType)
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    maxMark: {
        type: Number,
        required: true,
        min: 0
    },
    publicationDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    attachedFileUrl: {
        type: String,
        required: false
    }
});
Schema.virtual('id').get(common_1.get_id).set(common_1.set_id);
const Statics = {
    updateTask: async ({id, patch}) => ({ task: await Helpers.tryUpdateById(exports.Task, id, Helpers.filterNilProps(patch)) }),
    deleteTask: async ({id}) => ({ task: await Helpers.tryDeleteById(exports.Task, id) }),
    getTask: async ({id}) => ({ task: await Helpers.tryFindById(exports.Task, id) }),
    isTaskType: Vts.isInEnum(exports.TaskType)
};
const Methods = {
    myTaskResult(me) {
        return task_result_1.TaskResult.findOne({
            taskId: this._id,
            authorId: me.id
        }).exec();
    },
    author: common_1.getPopulated('authorId'),
    course: common_1.getPopulated('courseId'),
    getLocalTaskResults(req) {
        return Helpers.paginate(Object.assign({}, req, {
            model: task_result_1.TaskResult,
            sort: { lastUpdate: 'asc' },
            __filter: { taskId: this._id }
        }));
    },
    // deprecated
    toCoreJsonData() {
        return {
            id: String(this._id),
            maxMark: this.maxMark,
            taskType: this.taskType,
            title: this.title
        };
    },
    async toBasicJsonData() {
        return Object.assign({}, this.toCoreJsonData(), { author: (await this.author()).toBasicJsonData() });
    },
    async toJsonData() {
        return Object.assign({}, this.toCoreJsonData(), {
            author: (await this.author()).toJsonData(),
            attachedFileUrl: this.attachedFileUrl,
            body: this.body,
            courseId: String(this.courseId)
        });
    }
};
Schema.statics = Statics;
Schema.methods = Methods;
Schema.pre('remove', async function (next) {
    try {
        void (await task_result_1.TaskResult.where('taskId').equals(this._id).remove().exec());
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});
Schema.plugin(Paginate);
exports.Task = Mongoose.model('Task', Schema);