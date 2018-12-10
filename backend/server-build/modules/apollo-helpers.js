'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const _ = require('lodash');
const GqlV1 = require('../declarations/gql-gen-v1');
const Vts = require('vee-type-safe');
// import * as Debug     from '@modules/debug';
const Apollo = require('apollo-server-express');
// import * as Debug     from '@modules/debug';
const error_1 = require('./error');
const graphql_1 = require('graphql');
const escapeStringRegexp = require('escape-string-regexp');
class RoleGuardDirective extends Apollo.SchemaDirectiveVisitor {
    visitObject(type) {
        type[RoleGuardDirective._rolesSymbol] = this.args.roles;
        _.forOwn(type.getFields(), field => this.wrapField(field, type));
    }
    visitFieldDefinition(field, details) {
        field[RoleGuardDirective._rolesSymbol] = this.args.roles;
        this.wrapField(field, details.objectType);
    }
    wrapField(field, parentObject) {
        const {
            resolve = graphql_1.defaultFieldResolver
        } = field;
        const self = this;
        field.resolve = async function (...args) {
            const providedRoles = field[RoleGuardDirective._rolesSymbol] || parentObject[RoleGuardDirective._rolesSymbol];
            if (providedRoles) {
                const {user} = args[2];
                if (user) {
                    self.ensureAccess(user, providedRoles);
                } else {
                    self.ensureGuestAccess(providedRoles);
                }
            }
            return resolve.apply(this, args);
        };
    }
}
RoleGuardDirective._rolesSymbol = Symbol('min-role');
RoleGuardDirective._fieldsWrappedSymbol = Symbol('fields-wrapped');
exports.RoleGuardDirective = RoleGuardDirective;
class DenyGuardDirective extends RoleGuardDirective {
    static ensureRoleAccess(clientRole, providedRoles) {
        if (providedRoles.includes(clientRole)) {
            throw new Apollo.ForbiddenError(`insufficient permisions, '${ providedRoles.join(',') }' are forbidden to access this route`);
        }
    }
    // tslint:disable:prefer-function-over-method
    ensureAccess(user, providedRoles) {
        DenyGuardDirective.ensureRoleAccess(user.role, providedRoles);
    }
    ensureGuestAccess(providedRoles) {
        DenyGuardDirective.ensureRoleAccess(GqlV1.UserRole.Guest, providedRoles);
    }
}
exports.DenyGuardDirective = DenyGuardDirective;
class AllowGuardDirective extends RoleGuardDirective {
    static ensureRoleAccess(clientRole, providedRoles) {
        if (!providedRoles.includes(clientRole)) {
            throw new Apollo.ForbiddenError(`insufficient permisions, only '${ providedRoles.join(',') }' are allowed to access this route`);
        }
    }
    ensureGuestAccess(providedRoles) {
        AllowGuardDirective.ensureRoleAccess(GqlV1.UserRole.Guest, providedRoles);
    }
    ensureAccess(user, providedRoles) {
        AllowGuardDirective.ensureRoleAccess(user.role, providedRoles);
    }
}
exports.AllowGuardDirective = AllowGuardDirective;
function nothingFoundForId(id) {
    return error_1.notFoundGql(`nothing was found for id '${ id }'`);
}
function mapStringValuesToSearchRegexp(obj) {
    return _.mapValues(obj, value => typeof value === 'string' ? new RegExp(escapeStringRegexp(value), 'i') : value);
}
exports.mapStringValuesToSearchRegexp = mapStringValuesToSearchRegexp;
async function paginate({model, page, limit, search, sort, filter, __filter}) {
    try {
        Vts.ensureMatch({
            page,
            limit
        }, {
            page: Vts.isPositiveInteger,
            limit: Vts.isZeroOrPositiveInteger
        });
    } catch (err) {
        throw new Apollo.ValidationError(err.message);
    }
    // FIXME: remove type arguments
    const mongoSearch = mapStringValuesToSearchRegexp(search);
    const schemaDef = model.schema.obj;
    const mongoExcludeFilter = !filter || !filter.exclude ? {} : _.transform(filter.exclude, transformFilter(value => ({ $nin: _.castArray(value) })));
    const mongoIncludeFilter = !filter || !filter.include ? {} : _.transform(filter.include, transformFilter(value => Array.isArray(value) ? { $in: value } : value));
    const docsPage = await model.paginate(Object.assign(mongoSearch, mongoExcludeFilter, mongoIncludeFilter, __filter), {
        page,
        limit,
        sort
    });
    return {
        data: docsPage.docs,
        total: docsPage.total
    };
    function transformFilter(transformValue) {
        return (result, value, key) => {
            const meta = key in schemaDef ? {
                key,
                info: schemaDef[key]
            } : {
                key: schemaDef[paginate.metaSymbol][key].aliasFor,
                info: schemaDef[paginate.metaSymbol][key]
            };
            if (!meta.info.required || !_.isNil(value)) {
                result[meta.key] = transformValue(value);
            }
            return result;
        };
    }
}
exports.paginate = paginate;
function removeNilFromRequired(obj, schemaDef) {
    return _.transform(obj, (result, value, key) => {
        const meta = key in schemaDef ? {
            key,
            info: schemaDef[key]
        } : {
            key: schemaDef[paginate.metaSymbol][key].aliasFor,
            info: schemaDef[paginate.metaSymbol][key]
        };
        if (!meta.info.required || !_.isNil(value)) {
            result[meta.key] = value;
        }
        return result;
    });
}
exports.removeNilFromRequired = removeNilFromRequired;
const PaginateMetasymbol = Symbol('Paginate metadata schema symbol');
paginate.metaSymbol = PaginateMetasymbol;
async function tryDeleteById(model, id) {
    const doc = await model.findById(id);
    if (!doc) {
        throw nothingFoundForId(id);
    }
    return doc.remove();
}
exports.tryDeleteById = tryDeleteById;
async function tryUpdateById(model, id, update) {
    const updatedDoc = await model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!updatedDoc) {
        throw nothingFoundForId(id);
    }
    return updatedDoc;
}
exports.tryUpdateById = tryUpdateById;
async function tryFindById(model, id) {
    const doc = await model.findById(id);
    if (!doc) {
        throw error_1.notFoundGql(`nothing was found for id "${ id }"`);
    }
    return doc;
}
exports.tryFindById = tryFindById;
async function tryFindOne(model, criteria) {
    const doc = await model.findOne(criteria);
    if (!doc) {
        throw error_1.notFoundGql(`nothing was found`);
    }
    return doc;
}
exports.tryFindOne = tryFindOne;
function filterNilProps(obj) {
    return _.omitBy(obj, _.isNil);
}
exports.filterNilProps = filterNilProps;
function filterObjectIds(source, exclude) {
    return source.filter(srcId => !exclude.find(removeId => srcId.equals(removeId)));
}
exports.filterObjectIds = filterObjectIds;
function renameKey(obj, oldKey, newKey) {
    if (!obj || !(oldKey in obj)) {
        return obj;
    }
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
    return obj;
}
exports.renameKey = renameKey;