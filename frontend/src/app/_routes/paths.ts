import * as Api from '@public-api/v1';
import * as Vts from 'vee-type-safe';
import * as Gql from '@public-api/v1/gql';

export type RouteFn<
    TArgs extends string[] = string[],
    TCoreFn extends (...args: TArgs) => string = (...path: TArgs) => string
> = TCoreFn & {
    access: Set<Api.UserRole>;
    rel:    TCoreFn;
};

type AccessQuery   = typeof Gql.Access.Query;
type MutationQuery = typeof Gql.Access.Mutation;
type GenericAccess = Vts.BasicObject<Set<Gql.UserRole> | undefined>;
const Q: GenericAccess & AccessQuery   = Gql.Access.Query;
const M: GenericAccess & MutationQuery = Gql.Access.Mutation;

import RA = Api.RouteAccess;
const { Task, Course } = Api.V1;

// Courses routing
export const task       = route(id => `/tasks/${id}`,            RA.GET [Task.  Get. _(':id')]);
export const taskEdit   = route(id => `/tasks/${id}/edit`,       RA.PUT [Task.  Put. _(':id')]);
export const taskNew    = route(id => `/courses/${id}/task-new`, RA.POST[Task.  Post._(':id')]);
export const courseEdit = route(id => `/courses/${id}/edit`,     RA.PUT [Course.Put. _(':id')]);
export const courseNew  = route(() => `/courses/new`,            RA.POST[Course.Post._       ]);
export const course     = route(id => `/courses/${id}`,          RA.GET [Course.Get. _(':id')]);
// App routing:
export const courses   = route(() => `/courses`,         Q.getCourses);
export const about     = route(() => `/about`,           Api.FreeAccess);
export const developer = route(() => `/developer`,       Api.FreeAccess);
export const error     = route(() => `/error`,           Api.FreeAccess);
export const forbidden = route(() => `/error/forbidden`, Api.FreeAccess);
export const home      = route(() => `/`,                Api.FreeAccess);

// Users routing
export const login     = route(() => `/login`,            RA.POST[Api.Auth.Login.   Post._]);
export const register  = route(() => `/register`,         RA.POST[Api.Auth.Register.Post._]);
export const user      = route(id => `/users/${id}`,       Q.getUser);
export const userEdit  = route(id => `/users/${id}/edit`,  M.updateMe);
export const users     = route(() => `/users`,             Q.getUsers);
export const groups    = route(() => `/groups`,            Q.getGroups);
export const group     = route(id => `/groups/${id}`,      Q.getGroup);
export const groupEdit = route(id => `/groups/${id}/edit`, M.updateGroup);
export const groupNew  = route(() => `/groups/new`,        M.createGroup);

function route<TRouteFnArgs extends string[]>(
    pathFn: (...args: TRouteFnArgs) => string,
    access?: Set<Api.UserRole> | null
): RouteFn<TRouteFnArgs> {
    const routeFn = pathFn as RouteFn<TRouteFnArgs>;
    routeFn.access = access || Api.FreeAccess;
    routeFn.rel = function (...args: any[]) {
        return (pathFn.apply(this, args) as string).slice(1);
    };
    return routeFn;
}

export namespace external {
    export const graphqlPlayground = () => '/api/v1/gql';
    export const apiDocs           = () => '/graphdoc';
}
