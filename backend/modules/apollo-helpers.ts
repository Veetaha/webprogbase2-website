import * as Mongoose  from 'mongoose';
import * as _         from 'lodash';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as ApiV1     from '@public-api/v1';
import * as Vts       from 'vee-type-safe';
// import * as Debug     from '@modules/debug';
import * as Apollo    from 'apollo-server-express';
// import * as Debug     from '@modules/debug';
import { notFound       } from '@modules/error';
import { User           } from '@models/user';
import { ResolveContext } from '@declarations/gql-params-v1';

import {
    defaultFieldResolver,
    GraphQLObjectType,
    GraphQLField,
    GraphQLInterfaceType
} from 'graphql';

import escapeStringRegexp = require('escape-string-regexp');
import ObjectId           = Mongoose.Types.ObjectId;


export type Maybe<T> = T | null | undefined;

type AuthGqlField   = GraphQLField<unknown, unknown> & AuthMinRole;
type AuthGqlObjType = (GraphQLObjectType | GraphQLInterfaceType) & AuthMinRole;
export abstract class RoleGuardDirective extends Apollo.SchemaDirectiveVisitor {
    // throws on forbidden
    protected abstract ensureAccess(user: User, providedRoles: GqlV1.UserRole[]): void;
    protected abstract ensureGuestAccess(providedRoles: GqlV1.UserRole[]): void;

    static readonly _rolesSymbol         = Symbol('min-role');
    static readonly _fieldsWrappedSymbol = Symbol('fields-wrapped');

    visitObject(type: AuthGqlObjType) {
        type[RoleGuardDirective._rolesSymbol] = this.args.roles;
        _.forOwn(type.getFields(), (field: AuthGqlField) => this.wrapField(field, type));
    }
    visitFieldDefinition(
        field: AuthGqlField,
        details: { objectType: AuthGqlObjType }
    ) {
        field[RoleGuardDirective._rolesSymbol] = this.args.roles;
        this.wrapField(field, details.objectType);
    }
    private wrapField(field: AuthGqlField, parentObject: AuthGqlObjType) {
        const { resolve = defaultFieldResolver } = field;
        const self = this;
        field.resolve = async function (...args) {
            const providedRoles = field       [RoleGuardDirective._rolesSymbol] ||
                                  parentObject[RoleGuardDirective._rolesSymbol];
            
            if (providedRoles) {
                const { user } = args[2] as ResolveContext;
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
interface AuthMinRole {
    [RoleGuardDirective._rolesSymbol]?: GqlV1.UserRole[];
}
export class DenyGuardDirective extends RoleGuardDirective {
    
    private static ensureRoleAccess(clientRole: GqlV1.UserRole, providedRoles: GqlV1.UserRole[]) {
        if (providedRoles.includes(clientRole)) {
            throw new Apollo.ForbiddenError(`insufficient permisions, '${
                providedRoles.join(',')
            }' are forbidden to access this route`);
        }
    }
// tslint:disable:prefer-function-over-method
    protected ensureAccess(user: User, providedRoles: GqlV1.UserRole[]): void {
        DenyGuardDirective.ensureRoleAccess(user.role, providedRoles);
    }
    protected ensureGuestAccess(providedRoles: GqlV1.UserRole[]): void {
        DenyGuardDirective.ensureRoleAccess(GqlV1.UserRole.Guest, providedRoles);
    }
}
export class AllowGuardDirective extends RoleGuardDirective {
    private static ensureRoleAccess(clientRole: GqlV1.UserRole, providedRoles: GqlV1.UserRole[]) {
        if (!providedRoles.includes(clientRole)) {
            throw new Apollo.ForbiddenError(`insufficient permisions, only '${
                providedRoles.join(',')
            }' are allowed to access this route`);
        }
    }
    protected ensureGuestAccess(providedRoles: GqlV1.UserRole[]): void {
        AllowGuardDirective.ensureRoleAccess(GqlV1.UserRole.Guest, providedRoles);
    }
    protected ensureAccess(user: User, providedRoles: GqlV1.UserRole[]): void {
        AllowGuardDirective.ensureRoleAccess(user.role, providedRoles);
    }
}


function nothingFoundForId(id: ObjectId | string) {
    return notFound(`nothing was found for id '${id}'`);
}


type PaginateFilterOptions<T> = {
    [Key in keyof T]?: Maybe<T[Key] | T[Key][]>;
};

interface PaginateOptions<
    TDoc extends Mongoose.Document,
    TModel extends Mongoose.PaginateModel<TDoc>
> {
    model:         TModel;
    page:          number;
    limit:         number;
    search?:       Maybe<{ [Key in keyof TDoc]?: Maybe<TDoc[Key]>; }>;
    sort:          Vts.BasicObject<'asc' | 'desc'>;
    filter?:       Maybe<{
        include?: Maybe<PaginateFilterOptions<TDoc>>
        exclude?: Maybe<PaginateFilterOptions<TDoc>>
    }>;
}
export async function paginate<
    TDoc   extends Mongoose.Document,
    TModel extends Mongoose.PaginateModel<TDoc>
>({
    model,
    page,
    limit,
    search,
    sort,
    filter
}: PaginateOptions<TDoc, TModel>
): Promise<ApiV1.Paginated<TDoc>> {
    try {
        Vts.ensureMatch({ page, limit }, {
            page:  Vts.isPositiveInteger,
            limit: Vts.isZeroOrPositiveInteger
        });
    } catch (err) {
        throw new Apollo.ValidationError(err.message);
    }

    // FIXME: remove type arguments
    const mongoSearch = _.mapValues<unknown, unknown>(search, value => (
        typeof value === 'string'
            ? new RegExp(escapeStringRegexp(value), 'i')
            : value
    ));
    const schemaDef = model.schema.obj;

    const mongoExcludeFilter = !filter || !filter.exclude ? {} :
        _.transform(filter.exclude, transformFilter(
            value => ({ $nin: _.castArray(value) })
        ));
        
    const mongoIncludeFilter = !filter || !filter.include ? {} :
        _.transform(filter.include, transformFilter(
            value => Array.isArray(value) ? { $in: value } : value
        ));

    const docsPage = await model.paginate(
        Object.assign(mongoSearch, mongoExcludeFilter, mongoIncludeFilter),
        { page, limit, sort }
    );

    return {
        data:  docsPage.docs,
        total: docsPage.total
    };

    function transformFilter(
        transformValue: (value: unknown) => unknown
    ) {
        return ((result, value, key) => {
            const meta = key in schemaDef
                ? { key, info: schemaDef[key] }
                : {
                    key:  schemaDef[paginate.metaSymbol][key].aliasFor,
                    info: schemaDef[paginate.metaSymbol][key]
                };
            if (!meta.info.required || !_.isNil(value)) {
                result[meta.key] = transformValue(value);
            }
            return result;
        }) as _.MemoVoidDictionaryIterator<unknown, Vts.BasicObject>;
    }
}

const PaginateMetasymbol = Symbol('Paginate metadata schema symbol');
paginate.metaSymbol = PaginateMetasymbol;

export interface PaginateMetadata {
    [key: string] : {
        aliasFor?: string;
        required?: boolean;
    };
}



export async function tryDeleteById<TDoc extends Mongoose.Document> (
    model: Mongoose.Model<TDoc>, id: ObjectId
) {
    const doc = await model.findById(id);
    if (!doc) {
        throw nothingFoundForId(id);
    }
    return doc.remove();
}

export async function tryUpdateById<TDoc extends Mongoose.Document> (
    model:  Mongoose.Model<TDoc>,
    id:     ObjectId,
    update: Vts.BasicObject
) {
    const updatedDoc = await model.findByIdAndUpdate(id, update).exec();
    if (!updatedDoc) {
        throw nothingFoundForId(id);
    }
    return updatedDoc;
}

export async function tryFindById<TDoc extends Mongoose.Document>(
    model: Mongoose.Model<TDoc>, id: ObjectId
) {
    const doc = await model.findById(id);
    if (!doc) {
        throw notFound(`nothing was found for id "${id}"`);
    }
    return doc;
}

export function filterNilProps(obj: Vts.BasicObject) {
    return _.omitBy(obj, _.isNil);
}

export function filterObjectIds<T extends ObjectId[]>(source: T, exclude: ObjectId[]) {
    return source.filter(srcId => !exclude.find(removeId => srcId.equals(removeId)));
}