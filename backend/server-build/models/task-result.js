'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
// import * as Debug     from '@modules/debug';
const Paginate = require('mongoose-paginate');
const Helpers = require('../modules/apollo-helpers');
const _ = require('lodash');
const Apollo = require('apollo-server-express');
const common_1 = require('../modules/common');
const user_1 = require('./user');
const task_1 = require('./task');
const common_2 = require('../modules/common');
const TaskResultCheckSchema = new Mongoose.Schema({
    authorId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    comment: {
        type: String,
        required: false
    },
    score: {
        type: Number,
        required: true
    }
});
const TaskResultCheckMethods = {
    author() {
        return Helpers.tryFindById(user_1.User, this.authorId);
    }
};
TaskResultCheckSchema.methods = TaskResultCheckMethods;
const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    },
    authorId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'Task',
        required: true
    },
    lastUpdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    body: {
        type: String,
        required: false
    },
    fileUrl: {
        type: String,
        required: false
    },
    check: {
        type: TaskResultCheckSchema,
        required: false
    }
});
Schema.virtual('id').get(common_2.get_id).set(common_2.set_id);
const Statics = {
    async getTaskResults({page, limit, search}) {
        const [result] = await exports.TaskResult.aggregate([
            {
                $lookup: {
                    from: task_1.Task.collection.name,
                    localField: 'taskId',
                    foreignField: '_id',
                    as: '_task'
                }
            },
            { $unwind: '$_task' },
            { $match: Helpers.mapStringValuesToSearchRegexp(Helpers.renameKey(search, 'taskTitle', 'title')) },
            { $sort: { '_task.name': 1 } },
            {
                $facet: {
                    data: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit }
                    ],
                    total: [{ $count: '_count' }]
                }
            },
            {
                $project: {
                    data: 1,
                    total: '$total._count'
                }
            }
        ]).exec();
        result.data = result.data.map(obj => new exports.TaskResult(obj));
        return result;
    },
    getUserTaskResult: async req => ({ taskResult: await Helpers.tryFindOne(exports.TaskResult, req) }),
    getTaskResult: async ({id}) => ({ taskResult: await Helpers.tryFindById(exports.TaskResult, id) }),
    async createTaskResult(req, user) {
        void (await exports.TaskResult.ensureUserCanCreateTaskResult(user, req.taskId));
        return { taskResult: await exports.TaskResult.create(Object.assign({}, req, { authorId: user.id })) };
    },
    async updateTaskResult({id, patch}, user) {
        const {taskResult} = await exports.TaskResult.getTaskResult({ id });
        exports.TaskResult.ensureUserCanUpdateTaskResult(user, taskResult);
        return { taskResult: await Helpers.tryUpdateById(exports.TaskResult, id, Object.assign({}, patch, { lastUpdate: new Date() })) };
    },
    deleteTaskResult: async ({id}) => ({ taskResult: await Helpers.tryDeleteById(exports.TaskResult, id) }),
    async hasUserCreatedTaskResult(authorId, taskId) {
        return !!(await exports.TaskResult.findOne({
            authorId,
            taskId
        }));
    },
    async ensureUserHasntCreatedTaskResult(authorId, taskId) {
        if (await exports.TaskResult.hasUserCreatedTaskResult(taskId, authorId)) {
            throw new Apollo.ValidationError(`user has already submitted a result for this task`);
        }
    },
    async ensureUserCanCreateTaskResult(user, taskId) {
        user.ensureHasGroup();
        void (await exports.TaskResult.ensureUserHasntCreatedTaskResult(user.id, taskId));
        if (!(await exports.TaskResult.canSolveTask({ id: taskId }, user)).answer) {
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
        const [group, {task}] = await Promise.all([
            user.group(),
            task_1.Task.getTask({ id: req.id })
        ]);
        return { answer: !!group.coursesId.find(courseId => courseId.equals(task.courseId)) };
    }
};
const Methods = {
    author: common_1.getPopulated('authorId'),
    task: common_1.getPopulated('taskId'),
    async createCheck(req, authorId) {
        if (this.check) {
            throw new Apollo.ValidationError('task was already checked');
        }
        this.check = Object.assign({}, req.payload, { authorId });
        return { taskResult: await this.save() };
    },
    async updateCheck(patch, authorId) {
        if (!this.check) {
            throw new Apollo.ApolloError(`Can't update task result check as it doesn't exits`);
        }
        return {
            taskResult: await Helpers.tryUpdateById(exports.TaskResult, this.id, _.mapKeys(Object.assign({}, Helpers.removeNilFromRequired(patch, TaskResultCheckSchema.obj), {
                lastUpdate: new Date(),
                authorId
            }), (_value, key) => `check.${ key }`))
        };
    },
    async deleteCheck() {
        if (!this.check) {
            throw new Apollo.ApolloError(`Can't delete task result check as it doesn't exits`);
        }
        this.check = null;
        return { taskResult: await this.save() };
    }
};
Schema.methods = Methods;
Schema.statics = Statics;
Schema.plugin(Paginate);
// Schema.plugin(UniqueArrayPlugin);
exports.TaskResult = Mongoose.model('TaskResult', Schema);