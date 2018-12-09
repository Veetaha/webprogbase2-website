'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const Jwt = require('jsonwebtoken');
const Paginate = require('mongoose-paginate');
const Apollo = require('apollo-server-express');
const Vts = require('vee-type-safe');
const GqlV1 = require('../declarations/gql-gen-v1');
const Config = require('../config');
const ApiV1 = require('../public-api/v1/index');
const Helpers = require('../modules/apollo-helpers');
const _ = require('lodash');
const common_1 = require('../modules/common');
exports.UserRole = GqlV1.UserRole;
const common_2 = require('../modules/common');
exports.Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    },
    role: {
        type: String,
        required: true,
        enum: Object.values(exports.UserRole)
    },
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    avaUrl: {
        type: String,
        required: false
    },
    isDisabled: {
        type: Boolean,
        required: false,
        default: false
    },
    groupId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'Group',
        required: false
    }
});
exports.Schema.virtual('id').get(common_1.get_id).set(common_1.set_id);
function patchToMongoUpdate(patch) {
    return _.omitBy(patch, (key, value) => key === 'avaUrl' ? _.isUndefined(value) : _.isNil(value));
}
exports.Schema.statics = {
    updateUser: async ({id, patch}) => ({ user: await Helpers.tryUpdateById(exports.User, id, patchToMongoUpdate(patch)) }),
    deleteUser: async ({id}) => ({ user: await Helpers.tryDeleteById(exports.User, id) }),
    getUser: async ({id}) => ({ user: await Helpers.tryFindById(exports.User, id) }),
    getUsers: req => Helpers.paginate(Object.assign({}, req, {
        model: exports.User,
        sort: { login: 'asc' }
    })),
    unAssignGroup: (groupId, usersId) => exports.User.update({
        groupId,
        _id: { $in: usersId }
    }, { groupId: null }, { multi: true }).exec(),
    assignGroup: (groupId, usersId) => exports.User.update({ _id: { $in: usersId } }, { groupId }, { multi: true }).exec(),
    findByLoginPassword: (login, password) => exports.User.findOne({
        login,
        password: Config.encodePassword(password)
    }).exec(),
    // deprecated
    getPageRest: async pageArgs => common_2.paginate(exports.User, {
        pageArgs,
        map: user => user.toBasicJsonData(),
        searchField: 'login',
        lean: false,
        sort: { login: 'asc' }
    })
};
var PutUser = ApiV1.V1.User.Put;
const Methods = {
    group: common_1.getPopulated('groupId'),
    async updateMe({patch}) {
        Object.assign(this, patchToMongoUpdate(patch));
        return { me: await this.save() };
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
        const customPayload = { sub: String(this._id) };
        return Jwt.sign(customPayload, Config.RsaPrivateKey, {
            expiresIn: Config.JwtExpirationTime,
            algorithm: Config.JwtEncodingAlgorithm
        });
    },
    toBasicJsonData() {
        return {
            id: String(this._id),
            isDisabled: Boolean(this.isDisabled),
            avaUrl: this.avaUrl ? this.avaUrl : Config.DefaultUserAvatarUrl,
            login: this.login,
            fullname: this.fullname,
            role: this.role
        };
    },
    toJsonData() {
        return Object.assign({}, this.toBasicJsonData(), {
            group: this.groupId ? String(this.groupId) : null,
            registeredAt: this.registeredAt.toISOString()
        });
    }
};
exports.Schema.methods = Methods;
// Schema.index()
exports.Schema.plugin(Paginate);
exports.User = Mongoose.model('User', exports.Schema);