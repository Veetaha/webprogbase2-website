import * as mongoose  from 'mongoose';
import * as express   from 'express';
import * as Vts       from 'vee-type-safe';
import * as VtsEx     from 'vee-type-safe/express';

import { badRequest } from '@modules/error';
import * as ApiV1 from '@public-api/v1';
import escapeStringRegexp = require('escape-string-regexp');

interface PaginateOptions<
    TDoc extends mongoose.Document,
    TSelect extends keyof TDoc,
    TMapped extends { [Key in TSelect]?: any }
> {
    pageArgs:      ApiV1.PaginationArgs;
    searchField:   keyof TDoc;
    select?:       TSelect[];
    map?:          (doc: Vts.Take<TDoc, TSelect[]>) => TMapped;
    sort:          Vts.BasicObject<'asc' | 'desc'>;
    lean?:         boolean;
    searchFilter?: Partial<TDoc>;
}

export async function paginate<
    TDoc extends mongoose.Document,
    TModel extends mongoose.PaginateModel<TDoc>,
    TMapped extends { [Key in keyof TDoc]?: any }
>(
    model: TModel, {
    pageArgs: { page, limit, search },
    searchField,
    select,
    sort,
    map,
    searchFilter,
    lean = false
}: PaginateOptions<TDoc, keyof TDoc, TMapped>
): Promise<ApiV1.Paginated<TMapped>> {
    const docsPage = await model.paginate(Object.assign(
            search ? {
                [searchField]: new RegExp(escapeStringRegexp(search), 'i'),
            } : {},
            searchFilter
        ),
        {
            page,
            limit,
            sort: sort as any,
            select: select && select.join(' '),
            lean,
            leanWithId: lean
        }
    );
    return {
        data:  (map ? docsPage.docs.map(map) : docsPage.docs) as any,
        total: docsPage.total
    };
}


export function ensureValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw badRequest(`invalid id '${id}'`);
    }
}

export function tryMakeFindByIdQuery<TDoc extends mongoose.Document>(
    model: mongoose.Model<TDoc>,
    id: string
) {
    ensureValidId(id);
    return model.findById(id);
}

export async function tryFindById<TDoc extends mongoose.Document>(
    model: mongoose.Model<TDoc>,
    id: string
) {
    return tryMakeFindByIdQuery(model, id).exec();
}


declare global {
    namespace Express {
        interface Request {
            pagination?: ApiV1.PaginationArgs;
        }
    }
}

export function getPagination(
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
) {
    const mismatch = Vts.mismatch(req.query, ApiV1.PaginationQParamsGetRequestTD);
    if (mismatch) {
        next(new VtsEx.BadTypeStatusError(mismatch));
    }
    req.pagination = {
        page:  +req.query.page,
        limit: +req.query.limit,
        search: req.query.search
    };
    next();
}

export function getPopulated<TDoc extends mongoose.Document>(
    propName: Extract<keyof TDoc, string>
) {
    return async function(this: TDoc) {
        const doc = (await this.populate(propName).execPopulate())[propName];
        this.depopulate(propName);
        return doc;
    };
}
export function get_id<TDoc extends mongoose.Document = mongoose.Document>(this: TDoc) {
    return this._id;
}

