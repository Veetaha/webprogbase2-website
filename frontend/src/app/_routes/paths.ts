import * as Api from '@public-api/v1';
import * as Vts from 'vee-type-safe';

export type RouteFn<
    TCoreFn extends Vts.BasicFunctor<[string], string> =
                    Vts.BasicFunctor<[string], string>
> = TCoreFn & {
    access: Set<Api.UserRole>;
    rel: TCoreFn;
};

import RA = Api.RouteAccess;
const { Task, Course, User, /* Group, Groups, */ Courses, Users } = Api.V1;

// Courses routing
export const task       = route(id => `/tasks/${id}`,            RA.GET [Task.  Get. _(':id')]);
export const taskEdit   = route(id => `/tasks/${id}/edit`,       RA.PUT [Task.  Put. _(':id')]);
export const taskNew    = route(id => `/courses/${id}/task-new`, RA.POST[Task.  Post._(':id')]);
export const courseEdit = route(id => `/courses/${id}/edit`,     RA.PUT [Course.Put. _(':id')]);
export const courseNew  = route(() => `/courses/new`,            RA.POST[Course.Post._       ]);
export const course     = route(id => `/courses/${id}`,          RA.GET [Course.Get. _(':id')]);
// App routing:
export const courses   = route(() => `/courses`,         RA.GET[Courses.Get._]);
export const about     = route(() => `/about`,           Api.FreeAccess);
export const developer = route(() => `/developer`,       Api.FreeAccess);
export const error     = route(() => `/error`,           Api.FreeAccess);
export const forbidden = route(() => `/error/forbidden`, Api.FreeAccess);
export const home      = route(() => `/`,                Api.FreeAccess);

// Users routing
export const login    = route(() => `/login`,            RA.POST[Api.Auth.Login.   Post._]);
export const register = route(() => `/register`,         RA.POST[Api.Auth.Register.Post._]);
export const user     = route(id => `/users/${id}`,      RA.GET [User.  Get._(':id')     ]);
export const userEdit = route(id => `/users/${id}/edit`, RA.PUT [User.  Put._            ]);
export const users    = route(() => `/users`,            RA.GET [Users. Get._            ]);
// export const groups   = route(() => `groups`,           RA.GET [Groups.Get._            ]);
// export const group    = route(id => `groups/${id}`,     RA.GET [Group. Get._(':id')     ]);

function route<TFn extends Vts.BasicFunctor<[string], string>>(
    pathFn: TFn,
    access: Set<Api.UserRole>
): RouteFn<TFn> {
    pathFn.access = access;
    pathFn.rel = (...args: any[]) => (pathFn.apply(null, args) as string).slice(1);
    return pathFn as RouteFn<TFn>;
}

export namespace external {
    export const graphqlPlayground = () => '/api/v1/gql';
    export const apiDocs           = () => '/graphdoc';
}
