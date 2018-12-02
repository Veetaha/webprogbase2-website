import * as Mongoose  from 'mongoose';
import * as Debug     from '@modules/debug';
import * as Paginate  from 'mongoose-paginate';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Helpers   from '@modules/apollo-helpers';
import * as _         from 'lodash';
import { User, UserModel     } from '@models/user';
import { Course, CourseModel } from '@models/course';
import UniqueArrayPlugin = require('mongoose-unique-array');

import ObjectId = Mongoose.Types.ObjectId;
import MongoArray = Mongoose.Types.Array;
import { get_id } from '@modules/common';
type MongoIdArray = MongoArray<ObjectId>;

export interface GroupData {
    name:          string;
    creationDate:  Date;
    coursesId:     MongoIdArray;
}

const Schema = new Mongoose.Schema({
    coursesId:  {
        type: [ObjectId],
        ref:  'Course',
        required: true,
        unique: true // @TODO: wait for unique index to build
    },
    name:         { type: String,   required: true    },
    creationDate: { type: Date,     default: Date.now }
});

Schema.virtual('id').get(get_id);

const Methods = {
    getCourses(req) {
        return Helpers.paginate<Course, CourseModel>(Course, {
            ...req,
            sort: { publicationDate: 'desc' },
            searchFilter: {
                _id: { $in: this.coursesId }
            }
        });
    },
    getMembers(req) {
        return Helpers.paginate<User, UserModel>(User, {
            ...req,
            sort: { login: 'asc' },
            searchFilter: {
                groupId: this._id
            }
        });
    }
} as Group;
const Statics = {
    getGroups: req => Helpers.paginate<Group, GroupModel>(
        Group, { ...req, sort: { name: 'desc' } }
    ),
    async createGroup(req) {
        const newbie = await Group.create({
            name:      req.name,
            coursesId: req.courses || []
        });
        if (req.members && req.members.length) {
            await User.assignGroup(newbie._id, req.members);
        }
        return {
           group: newbie
        };
    },
    async updateGroup({id, patch: { name, addMembers, removeMembers, addCourses, removeCourses }}) {
        const target = await Helpers.tryFindById(Group, id) as Group;
        target.name = name || target.name;
        
        if (removeCourses) {
            const filtered = Helpers.filterObjectIds(target.coursesId, removeCourses);
            debugger;
            Debug.assert(filtered instanceof MongoArray);
            console.log('OK, mongoarray after filter');
            target.coursesId = filtered;
        }
        if (addCourses) {
            target.coursesId.addToSet(addCourses);
        }
        if (removeMembers) {
            User.unAssignGroup(target._id, removeMembers);
        }
        if (addMembers) {
            User.assignGroup(target._id, addMembers);
        }
        return { group: await target.save() };
    },
    deleteGroup: async ({ id }) => ({ group: await Helpers.tryDeleteById(Group, id) })
} as GroupModel;
Schema.methods = Methods;
Schema.statics = Statics;

Schema.plugin(Paginate);
Schema.plugin(UniqueArrayPlugin);
export const Group = Mongoose.model<Group, GroupModel>('Group', Schema);

export interface GroupModel extends Mongoose.PaginateModel<Group, GroupData> {
    getGroups  (req: GqlV1.GetGroupsRequest):   Promise<GqlV1.GetGroupsResponse>;
    createGroup(req: GqlV1.CreateGroupRequest): Promise<GqlV1.CreateGroupResponse>;
    updateGroup(req: GqlV1.UpdateGroupRequest): Promise<GqlV1.UpdateGroupResponse>;
    deleteGroup(req: GqlV1.DeleteGroupRequest): Promise<GqlV1.DeleteGroupResponse>;
}
export interface Group extends Mongoose.Document, GroupData  {
    getCourses(req: GqlV1.GetGroupCoursesRequest): Promise<GqlV1.GetGroupCoursesResponse>;
    getMembers(req: GqlV1.GetGroupMembersRequest): Promise<GqlV1.GetGroupMembersResponse>;
}