'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const error_1 = require('./error');
const common_1 = require('./common');
function nothingFoundForId(id) {
    return error_1.notFound(`nothing was found for id '${ id }'`);
}
function deleteById(model, getId = req => req.params.id) {
    return async (req, _res, next) => {
        try {
            const id = getId(req);
            const doc = await common_1.tryMakeFindByIdQuery(model, id).exec();
            if (!doc) {
                return next(nothingFoundForId(id));
            }
            void (await doc.remove());
            return next();
        } catch (err) {
            next(err);
        }
    };
}
exports.deleteById = deleteById;
function updateById(model, getId = req => req.params.id, getUpdate = req => req.body) {
    return async (req, _res, next) => {
        try {
            const id = getId(req);
            common_1.ensureValidId(id);
            if (!(await model.findByIdAndUpdate(id, getUpdate(req)).exec())) {
                return next(nothingFoundForId(id));
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };
}
exports.updateById = updateById;
function getById({model, queryProcessor = query => query, idParamName = 'id'}) {
    return async (req, _res, next) => {
        try {
            const id = req.params[idParamName];
            const doc = await queryProcessor(common_1.tryMakeFindByIdQuery(model, id)).exec();
            if (!doc) {
                return next(error_1.notFound(`nothing was found for id "${ id }"`));
            }
            req.db = { gotById: doc };
            next();
        } catch (err) {
            next(err);
        }
    };
}
exports.getById = getById;