import * as Mongoose  from 'mongoose';
import * as Jwt       from 'jsonwebtoken';
import * as Paginate  from 'mongoose-paginate';
import * as Vts       from 'vee-type-safe';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as Config    from '@app/config';
import * as ApiV1     from '@public-api/v1';
import * as Helpers   from '@modules/apollo-helpers';

import { get_id, getPopulated } from '@modules/common';
import { Group } from '@models/group';

export import UserRole = GqlV1.UserRole;
import ApiUser = ApiV1.Data.User;

import ObjectId = Mongoose.Types.ObjectId;
import { paginate } from '@modules/common';

export interface UserData {
    id:            ObjectId;
    login:         string;
    role:          UserRole;
    fullname:      string;
    password:      string;
    registeredAt:  Date;
    avaUrl?:       string | null;
    isDisabled:    boolean;
    groupId?:      ObjectId;
}

export const Schema = new Mongoose.Schema({
    role:         { type: String,  required: true,  enum: Object.values(UserRole) },
    login:        { type: String,  required: true },
    password:     { type: String,  required: true },
    fullname:     { type: String,  required: true },
    registeredAt: { type: Date,    default: Date.now },
    avaUrl:       { type: String,  required: false   },
    isDisabled:   { type: Boolean, required: false, default: false },
    groupId: {
        type: ObjectId,
        ref: 'Group',
        required: false
    }
});
Schema.virtual('id').get(get_id);

Schema.statics = {
    getUser: ({ id }) => Helpers.tryFindById(User, id),

    getUsers: ({ page, search, limit }) => Helpers.paginate<User, UserModel>(User, {
        page, limit, search, sort: { login: 'asc' }
    }),

    unAssignGroup: (groupId, usersId) => User
            .where('groupId').equals(groupId)
            .where('_id').in(usersId)
            .update({ groupId: null })
            .exec(),

    assignGroup: (groupId, usersId) => User
        .where('_id').in(usersId)
        .update({ groupId })
        .exec(),
        
    findByLoginPassword: async (login, password) => User.findOne({
        login, password: Config.encodePassword(password)
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
Schema.methods = {
    group: getPopulated<User>('groupId'),
    canPutUser(putReq) {
        const mismatch = Vts.mismatch(putReq, PutUser.RoleLimit[this.role]);
        if (mismatch) {
            return false;
        }
        return true;
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
} as User;

// Schema.index()

Schema.plugin(Paginate);

export const User = Mongoose.model<User, UserModel>('User', Schema);

// modified declaration file
export interface User extends Mongoose.Document<UserData>, UserData {
    makeJwt(): string;
    group(): Promise<Group>;


    // deprecated
    canPutUser(putReq: PutUser.Request): boolean;
    toJsonData(): ApiV1.Data.User.Json;
    toBasicJsonData(): ApiV1.Data.User.BasicJson;
}
export interface UserModel extends Mongoose.PaginateModel<User, UserData> {
    getUser(req: GqlV1.GetUserRequest):   Promise<User>;
    getUsers(req: GqlV1.GetUsersRequest): Promise<GqlV1.GetUsersResponse>;
    assignGroup  (groupId: ObjectId, usersId: ObjectId[]): Promise<number>;
    unAssignGroup(groupId: ObjectId, usersId: ObjectId[]): Promise<number>;
    findByLoginPassword(login: string, password: string): Promise<User | null>;

    // deprecated
    getPageRest(
        pageArgs: ApiV1.PaginationArgs
    ): Promise<ApiV1.Paginated<ApiUser.BasicJson>>;
}