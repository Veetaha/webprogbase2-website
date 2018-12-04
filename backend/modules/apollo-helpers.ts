import * as Mongoose  from 'mongoose';
import * as _         from 'lodash';
import * as GqlV1     from '@declarations/gql-gen-v1';
import * as ApiV1     from '@public-api/v1';
import * as Vts       from 'vee-type-safe';
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
import * as Apollo from 'apollo-server-express';

import escapeStringRegexp = require('escape-string-regexp');
import ObjectId           = Mongoose.Types.ObjectId;




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


type PaginateFilterOptions<T> = { [Key in keyof T]?: T[Key] | T[Key][]};

interface PaginateOptions<
    TDoc extends Mongoose.Document
> {
    page:          number;
    limit:         number;
    search?:       { [P in keyof TDoc]?: TDoc[P] | null; } | null;
    sort:          Vts.BasicObject<'asc' | 'desc'>;
    filter?:       {
        include: PaginateFilterOptions<TDoc>
        exclude: PaginateFilterOptions<TDoc>
    };
}

export async function paginate<
    TDoc extends Mongoose.Document,
    TModel extends Mongoose.PaginateModel<TDoc>
>(
    model: TModel, {
    page,
    limit,
    search,
    sort,
    filter
}: PaginateOptions<TDoc>
): Promise<ApiV1.Paginated<TDoc>> {
    Vts.ensureMatch({ page, limit }, {
        page: Vts.isPositiveInteger,
        limit: Vts.isZeroOrPositiveInteger
    });

    const mappedSearch = !search ? {} : _.mapValues(search as object, value => (
        typeof value === 'string'
            ? new RegExp(escapeStringRegexp(value), 'i')
            : value
    ));
    const docsPage = await model.paginate(
        // tslint:disable-next-line:prefer-object-spread
        Object.assign(mappedSearch, filter),
        { page, limit, sort }
    );

    return {
        data:  docsPage.docs,
        total: docsPage.total
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

export type Maybe<T> = T | null | undefined;

export function filterNilAtRequired(source: Maybe<Vts.BasicObject>, schema: Mongoose.Schema) {
    return _.pickBy(source, (value, key) => (
        !schema.obj[key].required || !_.isNil(value))
    );
}