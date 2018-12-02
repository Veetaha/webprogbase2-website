import * as mongoose  from 'mongoose';
import * as express   from 'express';
import * as Vts       from 'vee-type-safe';
import { notFound }   from '@modules/error';
import { tryMakeFindByIdQuery, ensureValidId } from './common';

declare global {
    namespace Express {
        interface Request {
            db: {
                gotById: mongoose.Document
            };
        }
    }
}

function nothingFoundForId(id: string) {
    return notFound(`nothing was found for id '${id}'`);
}

export function deleteById<TDoc extends mongoose.Document> (
    model:     mongoose.Model<TDoc>,
    getId:     (req: express.Request) => string          = req => req.params.id
): express.RequestHandler {
    return async (req, _res, next) => {
        try {
            const id  = getId(req);
            const doc = await tryMakeFindByIdQuery(model, id).exec();
            if (!doc) {
                return next(nothingFoundForId(id));
            }
            void await doc.remove();
            return next();
        } catch (err) {
            next(err);
        }
    };
}

export function updateById<TDoc extends mongoose.Document> (
    model:     mongoose.Model<TDoc>,
    getId:     (req: express.Request) => string          = req => req.params.id,
    getUpdate: (req: express.Request) => Vts.BasicObject = req => req.body
): express.RequestHandler {
    return async (req, _res, next) => {
        try {
            const id = getId(req);
            ensureValidId(id);
            if (!await model.findByIdAndUpdate(id, getUpdate(req)).exec()) {
                return next(nothingFoundForId(id));
            }
            return next();
        } catch (err) {
            return next(err);
        }
    };
}

type QueryProcessorFn<TDoc extends mongoose.Document> =
    (query: mongoose.DocumentQuery<TDoc | null, TDoc>) => mongoose.DocumentQuery<TDoc | null, TDoc>;

interface GetByIdArgument<TDoc extends mongoose.Document> {
    model: mongoose.Model<TDoc>;
    queryProcessor?: QueryProcessorFn<TDoc>;
    idParamName?: string;
}

export function getById<TDoc extends mongoose.Document>({
    model, queryProcessor = query => query, idParamName = 'id'
}: GetByIdArgument<TDoc>): express.RequestHandler {
    return async (req, _res, next) => {
        try {
            const id = req.params[idParamName];
            const doc = await queryProcessor(tryMakeFindByIdQuery(model, id)).exec();
            if (!doc) {
                return next(notFound(`nothing was found for id "${id}"`));
            }
            req.db = {
                gotById: doc
            };
            next();
        } catch (err) {
            next(err);
        }
    };
}
