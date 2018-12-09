'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Mongoose = require('mongoose');
const Vts = require('vee-type-safe');
const VtsEx = require('vee-type-safe/express');
const error_1 = require('./error');
const ApiV1 = require('../public-api/v1/index');
const escapeStringRegexp = require('escape-string-regexp');
async function paginate(model, {
    pageArgs: {page, limit, search},
    searchField,
    select,
    sort,
    map,
    searchFilter,
    lean = false
}) {
    const docsPage = await model.paginate(Object.assign(search ? { [searchField]: new RegExp(escapeStringRegexp(search), 'i') } : {}, searchFilter), {
        page,
        limit,
        sort: sort,
        select: select && select.join(' '),
        lean,
        leanWithId: lean
    });
    return {
        data: map ? docsPage.docs.map(map) : docsPage.docs,
        total: docsPage.total
    };
}
exports.paginate = paginate;
function ensureValidId(id) {
    if (!Mongoose.Types.ObjectId.isValid(id)) {
        throw error_1.badRequest(`invalid id '${ id }'`);
    }
}
exports.ensureValidId = ensureValidId;
function tryMakeFindByIdQuery(model, id) {
    ensureValidId(id);
    return model.findById(id);
}
exports.tryMakeFindByIdQuery = tryMakeFindByIdQuery;
async function tryFindById(model, id) {
    return tryMakeFindByIdQuery(model, id).exec();
}
exports.tryFindById = tryFindById;
function getPagination(req, _res, next) {
    const mismatch = Vts.mismatch(req.query, ApiV1.PaginationQParamsGetRequestTD);
    if (mismatch) {
        next(new VtsEx.BadTypeStatusError(mismatch));
    }
    req.pagination = {
        page: +req.query.page,
        limit: +req.query.limit,
        search: req.query.search
    };
    next();
}
exports.getPagination = getPagination;
function getPopulated(propName) {
    return async function () {
        const doc = (await this.populate(propName).execPopulate())[propName];
        this.depopulate(propName);
        return doc;
    };
}
exports.getPopulated = getPopulated;
function set_id(id) {
    return this._id = id;
}
exports.set_id = set_id;
function get_id() {
    return this._id;
}
exports.get_id = get_id;