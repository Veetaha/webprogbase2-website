'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');
// import * as Vts             from 'vee-type-safe
const Apollo = require('apollo-server-express');
const Debug = require('../modules/debug');
const task_1 = require('./task');
const group_1 = require('./group');
const Helpers = require('../modules/apollo-helpers');
const common_1 = require('../modules/common');
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
    description: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});
Schema.virtual('id').get(common_1.get_id).set(common_1.set_id);
Schema.statics = {
    updateCourse: async ({id, patch}) => ({ course: await Helpers.tryUpdateById(exports.Course, id, Helpers.filterNilProps(patch)) }),
    deleteCourse: async ({id}) => ({ course: await Helpers.tryDeleteById(exports.Course, id) }),
    getCourse: async ({id}) => ({ course: await Helpers.tryFindById(exports.Course, id) }),
    getCourses: req => Helpers.paginate(Object.assign({}, req, {
        model: exports.Course,
        sort: { name: 'desc' }
    })),
    areValidIds: async suspect => (await exports.Course.where('_id').in(suspect).count().exec()) === suspect.length,
    async ensureValidIds(suspect) {
        if (!(await exports.Course.areValidIds(suspect))) {
            throw new Apollo.ValidationError('bad courses id array');
        }
    },
    getPageRest: pageArgs => common_1.paginate(exports.Course, {
        pageArgs,
        searchField: 'name',
        select: [
            '_id',
            'name',
            'description',
            'publicationDate'
        ],
        sort: { publicationDate: 'desc' },
        map: course => ({
            id: String(course._id),
            publicationDate: String(course.publicationDate),
            description: course.description,
            name: course.name
        })
    })
};
Schema.methods = {
    author: common_1.getPopulated('authorId'),
    getTasks(req) {
        return Helpers.paginate(Object.assign({}, req, {
            model: task_1.Task,
            filter: { include: { courseId: this._id } },
            sort: { publicationDate: 'desc' }
        }));
    },
    toCoreJsonData() {
        return {
            id: String(this._id),
            description: this.description,
            name: this.name,
            publicationDate: this.publicationDate.toISOString()
        };
    },
    async toBasicJsonData() {
        return Object.assign({}, this.toCoreJsonData(), { author: (await this.author()).toBasicJsonData() });
    },
    async toJsonData(pageArgs) {
        return Object.assign({}, this.toCoreJsonData(), {
            author: (await this.author()).toJsonData(),
            tasks: await common_1.paginate(task_1.Task, {
                pageArgs,
                searchField: 'title',
                searchFilter: { courseId: this._id },
                sort: { publicationDate: 'desc' },
                map: task => task.toCoreJsonData()
            })
        });
    }
};
Schema.pre('remove', async function (next) {
    try {
        void (await Promise.all([
            task_1.Task.where('courseId').equals(this._id).remove().exec(),
            group_1.Group.where('coursesId._id').equals(this._id).remove().exec()
        ]));
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});
Schema.plugin(Paginate);
exports.Course = Mongoose.model('Course', Schema);