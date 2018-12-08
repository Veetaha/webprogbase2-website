import * as Mongoose  from 'mongoose';
import * as Debug     from '@modules/debug';
import * as Paginate  from 'mongoose-paginate';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Helpers   from '@modules/apollo-helpers';
// import * as Vts       from 'vee-type-safe';
import * as _         from 'lodash';
import { User, UserModel     } from '@models/user';
import { Course, CourseModel } from '@models/course';
// import * as Apollo    from 'apollo-server-express';
// import UniqueArrayPlugin = require('mongoose-unique-array');

import ObjectId = Mongoose.Types.ObjectId;
import MongoArray = Mongoose.Types.Array;
import { get_id, set_id } from '@modules/common';
type MongoIdArray = MongoArray<ObjectId>;

export interface GroupData {
    name:          string;
    creationDate:  Date;
    coursesId:     MongoIdArray;
}

const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    coursesId:  {
        type: [Mongoose.SchemaTypes.ObjectId],
        ref:  'Course',
        required: true
    },
    name:         { type: String,   required: true    },
    creationDate: { type: Date,     required: true, default: Date.now }
});

Schema.virtual('id').get(get_id).set(set_id);

const Statics = {
    getGroup: async ({ id }) => ({ group: await Helpers.tryFindById(Group, id) }),

    getGroups: req => Helpers.paginate<Group, GroupModel>({
        ...req,
        model: Group,
        sort: { name: 'desc' }
    }),
    async createGroup({ name, courses, members }) {
        if (!_.isEmpty(courses)) {
            Course.ensureValidIds(courses!);
        }
         
        const group = await Group.create({
            name,
            coursesId: courses || []
        });

        if (!_.isEmpty(members)) {
            void await User.assignGroup(group._id, members!);
        }
        return { group };
    },
    async updateGroup({id, patch: { name, addMembers, removeMembers, addCourses, removeCourses }}) {
        if (!_.isEmpty(addCourses)) {
            Course.ensureValidIds(addCourses!);
        }

        const group = await Helpers.tryFindById(Group, id) as Group;
        group.name = name || group.name;
        
        if (!_.isEmpty(removeCourses)) {
            group.coursesId = Helpers.filterObjectIds(
                group.coursesId, removeCourses!
            ) as any;
        }
        if (!_.isEmpty(addCourses)) {
            group.coursesId.addToSet(...addCourses!);
        }
        void await Promise.all<any>([
            !_.isEmpty(removeMembers) && User.unAssignGroup(id, removeMembers!),
            !_.isEmpty(addMembers)    && User.assignGroup  (id, addMembers!)
        ]);
        return { group: await group.save() };
    },
    deleteGroup: async ({ id }) => ({ group: await Helpers.tryDeleteById(Group, id) })
} as GroupModel;

const Methods = {
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
    }
} as Group;

Schema.methods = Methods;
Schema.statics = Statics;

Schema.pre('remove', async function(this: Course, next) {
    try {
        void await User.update(
            { groupId: this._id },
            { groupId: null     },
            { multi: true }
        ).exec();
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});


Schema.plugin(Paginate);
// Schema.plugin(UniqueArrayPlugin);
export const Group = Mongoose.model<Group, GroupModel>('Group', Schema);

export interface GroupModel extends Mongoose.PaginateModel<Group, GroupData> {
    getGroups  (req: GqlV1.GetGroupsRequest):   Promise<GqlV1.GetGroupsResponse>;
    getGroup   (req: GqlV1.GetGroupRequest):    Promise<GqlV1.GetGroupResponse>;
    createGroup(req: GqlV1.CreateGroupRequest): Promise<GqlV1.CreateGroupResponse>;
    updateGroup(req: GqlV1.UpdateGroupRequest): Promise<GqlV1.UpdateGroupResponse>;
    deleteGroup(req: GqlV1.DeleteGroupRequest): Promise<GqlV1.DeleteGroupResponse>;
}
export interface Group extends Mongoose.Document, GroupData  {
    getCourses(req: GqlV1.GetGroupCoursesRequest): Promise<GqlV1.GetGroupCoursesResponse>;
    getMembers(
        req: GqlV1.GetGroupMembersRequest
    ): Promise<GqlV1.GetGroupMembersResponse>;
}
