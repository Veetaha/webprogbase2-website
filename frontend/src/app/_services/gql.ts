export interface GetUsersRequest {
    /** Amount of users per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: UsersSearch | null;
}

export interface UsersSearch {
    /** User's login filter (case and substring position insensitive) */
    login?: string | null;
}

export interface GetCoursesRequest {
    /** Amount of courses per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: CoursesSearch | null;
}

export interface CoursesSearch {
    /** Course's name filter (case and substring position insensitive) */
    name?: string | null;
}

export interface GetTasksRequest {
    /** 1-based page number. */
    page: number;
    /** Amount of tasks per page. */
    limit: number;
    /** Search filters. */
    search?: TasksSearch | null;
}

export interface TasksSearch {
    /** Course's title filter (case and substring position insensitive) */
    title?: string | null;
}

export interface GetUserRequest {
    /** Target user id. */
    id: string;
}

export interface GetTaskRequest {
    /** Target task id. */
    id: string;
}

export interface GetCourseRequest {
    /** Target course id. */
    id: string;
}
/** Holds the payload of the new task. */
export interface CreateTaskRequest {
    courseId: string;

    taskType: TaskType;

    title: string;

    body: string;

    attachedFileUrl?: string | null;

    maxMark: number;
}
/** Holds the payload of the new course. */
export interface CreateCourseRequest {
    description: string;

    name: string;
}

export interface UpdateMeRequest {
    /** Payload of the data to update. */
    patch: UpdateMePatch;
}

export interface UpdateMePatch {
    fullname?: string | null;

    avaUrl?: string | null;
}

export interface UpdateUserRequest {
    /** Target user id. */
    id: string;
    /** Payload of the data to update. */
    patch: UpdateUserPatch;
}

export interface UpdateUserPatch {
    role?: UserRole | null;

    fullname?: string | null;

    avaUrl?: string | null;

    isDisabled?: boolean | null;
}

export interface UpdateTaskRequest {
    /** Target task id. */
    id: string;
    /** Payload of the data to update. */
    patch: TaskUpdatePatch;
}

export interface TaskUpdatePatch {
    taskType?: TaskType | null;

    title?: string | null;

    body?: string | null;

    attachedFileUrl?: string | null;

    maxMark?: number | null;
}

export interface UpdateCourseRequest {
    /** Target course id. */
    id: string;
    /** Payload of the data to update. */
    patch: CourseUpdatePatch;
}

export interface CourseUpdatePatch {
    description?: string | null;

    name?: string | null;
}

export interface DeleteUserRequest {
    /** Target user id. */
    id: string;
}

export interface DeleteTaskRequest {
    /** Target task id. */
    id: string;
}

export interface DeleteCourseRequest {
    /** Target course id. */
    id: string;
}
/** User role limits access for some resources.See @deny and @access directives for each endpoint.By default, if no such directive is applied, the endpoint is freely accessible. */
export enum UserRole {
    Guest = "guest",
    Student = "student",
    Teacher = "teacher",
    Admin = "admin"
}
/** Represents an academic task type, currently it has no special meaning. */
export enum TaskType {
    Homework = "homework",
    Lab = "lab",
    Test = "test",
    Exam = "exam"
}

/** Bson ObjectId format compliant string, i.e. 24 hexadecimal characters. */
export type Boid = string;

/** ISO-8601 format compliant date-time string. */
export type Date = string;

export type TypeMatchedScalar = any;

// ====================================================
// Documents
// ====================================================

export namespace GetCourses {
    export type Variables = {
        req: GetCoursesRequest;
    };

    export type Query = {
        __typename?: "Query";

        getCourses: GetCourses;
    };

    export type GetCourses = {
        __typename?: "GetCoursesResponse";

        total: number;

        data: Data[];
    };

    export type Data = {
        __typename?: "Course";

        id: string;

        name: string;

        description: string;
    };
}

export namespace GetUsers {
    export type Variables = {
        req: GetUsersRequest;
    };

    export type Query = {
        __typename?: "Query";

        getUsers: GetUsers;
    };

    export type GetUsers = {
        __typename?: "GetUsersResponse";

        total: number;

        data: Data[];
    };

    export type Data = {
        __typename?: "User";

        id: string;

        role: UserRole;

        login: string;

        fullname: string;

        avaUrl: string;
    };
}

export namespace GetUser {
    export type Variables = {
        req: GetUserRequest;
    };

    export type Query = {
        __typename?: "Query";

        getUser: GetUser;
    };

    export type GetUser = {
        __typename?: "User";

        id: string;

        login: string;

        role: UserRole;

        fullname: string;

        registeredAt: string;

        avaUrl: string;

        isDisabled: boolean;
    };
}

export namespace UpdateUser {
    export type Variables = {
        req: UpdateUserRequest;
    };

    export type Mutation = {
        __typename?: "Mutation";

        updateUser: UpdateUser;
    };

    export type UpdateUser = {
        __typename?: "UpdateUserResponse";

        user: User;
    };

    export type User = {
        __typename?: "User";

        isDisabled: boolean;
    };
}

export namespace UpdateMe {
    export type Variables = {
        req: UpdateMeRequest;
    };

    export type Mutation = {
        __typename?: "Mutation";

        updateMe: UpdateMe;
    };

    export type UpdateMe = {
        __typename?: "UpdateMeResponse";

        me: Me;
    };

    export type Me = {
        __typename?: "User";

        isDisabled: boolean;
    };
}

// ====================================================
// START: Apollo Angular template
// ====================================================

import { Injectable } from "@angular/core";
import * as Apollo from "apollo-angular";

import gql from "graphql-tag";

// ====================================================
// Apollo Services
// ====================================================

@Injectable({
    providedIn: "root"
})
export class GetCoursesGQL extends Apollo.Query<
    GetCourses.Query,
    GetCourses.Variables
> {
    document: any = gql`
        query getCourses($req: GetCoursesRequest!) {
            getCourses(req: $req) {
                total
                data {
                    id
                    name
                    description
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class GetUsersGQL extends Apollo.Query<
    GetUsers.Query,
    GetUsers.Variables
> {
    document: any = gql`
        query getUsers($req: GetUsersRequest!) {
            getUsers(req: $req) {
                total
                data {
                    id
                    role
                    login
                    fullname
                    avaUrl
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class GetUserGQL extends Apollo.Query<GetUser.Query, GetUser.Variables> {
    document: any = gql`
        query getUser($req: GetUserRequest!) {
            getUser(req: $req) {
                id
                login
                role
                fullname
                registeredAt
                avaUrl
                isDisabled
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class UpdateUserGQL extends Apollo.Mutation<
    UpdateUser.Mutation,
    UpdateUser.Variables
> {
    document: any = gql`
        mutation updateUser($req: UpdateUserRequest!) {
            updateUser(req: $req) {
                user {
                    isDisabled
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class UpdateMeGQL extends Apollo.Mutation<
    UpdateMe.Mutation,
    UpdateMe.Variables
> {
    document: any = gql`
        mutation updateMe($req: UpdateMeRequest!) {
            updateMe(req: $req) {
                me {
                    isDisabled
                }
            }
        }
    `;
}

// ====================================================
// END: Apollo Angular template
// ====================================================
