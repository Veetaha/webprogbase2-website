'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const Debug = require('../modules/debug');
const Paginate = require('mongoose-paginate');
const Helpers = require('../modules/apollo-helpers');
// import * as Vts       from 'vee-type-safe';
const _ = require('lodash');
const user_1 = require('./user');
const course_1 = require('./course');
const common_1 = require('../modules/common');
const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    },
    coursesId: {
        type: [Mongoose.SchemaTypes.ObjectId],
        ref: 'Course',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});
Schema.virtual('id').get(common_1.get_id).set(common_1.set_id);
const Statics = {
    getGroup: async ({id}) => ({ group: await Helpers.tryFindById(exports.Group, id) }),
    getGroups: req => Helpers.paginate(Object.assign({}, req, {
        model: exports.Group,
        sort: { name: 'desc' }
    })),
    async createGroup({name, courses, members}) {
        if (!_.isEmpty(courses)) {
            course_1.Course.ensureValidIds(courses);
        }
        const group = await exports.Group.create({
            name,
            coursesId: courses || []
        });
        if (!_.isEmpty(members)) {
            void (await user_1.User.assignGroup(group._id, members));
        }
        return { group };
    },
    async updateGroup({
        id,
        patch: {name, addMembers, removeMembers, addCourses, removeCourses}
    }) {
        if (!_.isEmpty(addCourses)) {
            course_1.Course.ensureValidIds(addCourses);
        }
        const group = await Helpers.tryFindById(exports.Group, id);
        group.name = name || group.name;
        if (!_.isEmpty(removeCourses)) {
            group.coursesId = Helpers.filterObjectIds(group.coursesId, removeCourses);
        }
        if (!_.isEmpty(addCourses)) {
            group.coursesId.addToSet(...addCourses);
        }
        void (await Promise.all([
            !_.isEmpty(removeMembers) && user_1.User.unAssignGroup(id, removeMembers),
            !_.isEmpty(addMembers) && user_1.User.assignGroup(id, addMembers)
        ]));
        return { group: await group.save() };
    },
    deleteGroup: async ({id}) => ({ group: await Helpers.tryDeleteById(exports.Group, id) })
};
const Methods = {
    getCourses(req) {
        return Helpers.paginate(Object.assign({}, req, {
            model: course_1.Course,
            sort: { publicationDate: 'desc' },
            filter: { include: { id: this.coursesId } }
        }));
    },
    async getMembers(req) {
        return Helpers.paginate(Object.assign({}, req, {
            model: user_1.User,
            sort: { login: 'asc' },
            filter: { include: { groupId: this._id } }
        }));
    }
};
Schema.methods = Methods;
Schema.statics = Statics;
Schema.pre('remove', async function (next) {
    try {
        void (await user_1.User.update({ groupId: this._id }, { groupId: null }, { multi: true }).exec());
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});
Schema.plugin(Paginate);
// Schema.plugin(UniqueArrayPlugin);
exports.Group = Mongoose.model('Group', Schema);