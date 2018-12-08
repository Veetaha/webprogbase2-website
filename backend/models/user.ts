import * as Mongoose  from 'mongoose';
import * as Jwt       from 'jsonwebtoken';
import * as Paginate  from 'mongoose-paginate';
import * as Apollo    from 'apollo-server-express';
import * as Vts       from 'vee-type-safe';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Config    from '@app/config';
import * as ApiV1     from '@public-api/v1';
import * as Helpers   from '@modules/apollo-helpers';
import * as _         from 'lodash';

import { get_id, getPopulated, set_id } from '@modules/common';
import { Group } from '@models/group';

export import UserRole = GqlV1.UserRole;
import ApiUser = ApiV1.Data.User;

import ObjectId = Mongoose.Types.ObjectId;
import { paginate } from '@modules/common';

export interface UserData {
    // id:            ObjectId;
    login:         string;
    role:          UserRole;
    fullname:      string;
    password:      string;
    registeredAt:  Date;
    avaUrl?:       string | null;
    isDisabled:    boolean;
    groupId?:      ObjectId | null;
}

export const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    role:         { type: String,  required: true,  enum: Object.values(UserRole) },
    login:        { type: String,  required: true },
    password:     { type: String,  required: true },
    fullname:     { type: String,  required: true },
    registeredAt: { type: Date,    required: true, default: Date.now },
    avaUrl:       { type: String,  required: false   },
    isDisabled:   { type: Boolean, required: false, default: false },
    groupId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
        required: false
    }
});
Schema.virtual('id').get(get_id).set(set_id);

function patchToMongoUpdate(patch: GqlV1.UpdateMePatch | GqlV1.UpdateUserPatch) {
    return _.omitBy(patch, (key, value) => (
        key === 'avaUrl' ? _.isUndefined(value) : _.isNil(value)
    ));
}

Schema.statics = {
    updateUser: async ({ id, patch }) => ({
        user: await Helpers.tryUpdateById(User, id, patchToMongoUpdate(patch))
    }),

    deleteUser: async ({ id }) => ({ user: await Helpers.tryDeleteById(User, id) }),
    getUser:    async ({ id }) => ({ user: await Helpers.tryFindById(User, id)   }),

    getUsers: req => Helpers.paginate<User, UserModel>({
        ...req,
        model: User,
        sort: { login: 'asc' },
    }),

    unAssignGroup: (groupId, usersId) => User
        .update({ groupId, _id: { $in: usersId } },
                { groupId: null },
                { multi: true }
        ).exec(),

    assignGroup: (groupId, usersId) => User
        .update({ _id: { $in: usersId } },
                { groupId },
                { multi: true}
        ).exec(),
        
    findByLoginPassword: (login, password) => User.findOne({
        login,
        password: Config.encodePassword(password)
    }).exec(),

    // deprecated
    getPageRest: async pageArgs => paginate<User, UserModel, ApiUser.BasicJson>(User, {
        pageArgs,
        map: user => user.toBasicJsonData(),
        searchField: 'login',
        lean: false,
        sort: { login: 'asc' }
    })
} as UserModel;

import PutUser = ApiV1.V1.User.Put;
const Methods: UserMethods = {
    group: getPopulated<User>('groupId'),

    async updateMe({ patch }) {
        Object.assign(this, patchToMongoUpdate(patch));
        return {
            me: await this.save()
        };
    },
    ensureHasGroup() {
        if (!this.groupId) {
            throw new Apollo.ForbiddenError(`user is required to be assigned to a group`);
        }
    },








    canPutUser(putReq) {
        return Vts.exactlyConforms(putReq, PutUser.RoleLimit[this.role]);
    },
    makeJwt() {
        const customPayload: ApiV1.Data.CustomJwtPayload = {
            sub: String(this._id)
        };
        return Jwt.sign(customPayload, Config.RsaPrivateKey, {
            expiresIn: Config.JwtExpirationTime,
            algorithm: Config.JwtEncodingAlgorithm
        });
    },
    toBasicJsonData() {
        return {
            id:           String(this._id),
            isDisabled:   Boolean(this.isDisabled),
            avaUrl:       this.avaUrl ? this.avaUrl : Config.DefaultUserAvatarUrl,
            login:        this.login,
            fullname:     this.fullname,
            role:         this.role
        };
    },
    toJsonData() {
        return {
            ...this.toBasicJsonData(),
            group:        this.groupId ? String(this.groupId) : null,
            registeredAt: this.registeredAt!.toISOString(),
        };
    }
};

Schema.methods = Methods;
// Schema.index()

Schema.plugin(Paginate);

export const User = Mongoose.model<User, UserModel>('User', Schema);

export interface UserMethods {
    makeJwt(this: User): string;
    group(this: User): Promise<Group>;
    updateMe(this: User, req: GqlV1.UpdateMeRequest): Promise<GqlV1.UpdateMeResponse>;

    ensureHasGroup(this: User): void;

    // deprecated
    canPutUser(this: User, putReq: PutUser.Request): boolean;
    toJsonData(this: User): ApiV1.Data.User.Json;
    toBasicJsonData(this: User): ApiV1.Data.User.BasicJson;
}
export interface User extends Mongoose.Document, UserData, UserMethods {
}
export interface UserModel extends Mongoose.PaginateModel<User> {
    updateUser(req: GqlV1.UpdateUserRequest): Promise<GqlV1.UpdateUserResponse>;
    deleteUser(req: GqlV1.DeleteUserRequest): Promise<GqlV1.DeleteUserResponse>;
    getUser(req: GqlV1.GetUserRequest):       Promise<GqlV1.GetUserResponse>;
    getUsers(req: GqlV1.GetUsersRequest):     Promise<GqlV1.GetUsersResponse>;
    assignGroup  (groupId: ObjectId, usersId: ObjectId[]): Promise<number>;
    unAssignGroup(groupId: ObjectId, usersId: ObjectId[]): Promise<number>;
    findByLoginPassword(login: string, password: string): Promise<User | null>;
    

    // deprecated
    getPageRest(
        pageArgs: ApiV1.PaginationArgs
    ): Promise<ApiV1.Paginated<ApiUser.BasicJson>>;
}