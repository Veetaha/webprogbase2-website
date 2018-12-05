export interface GetGroupCoursesRequest {
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

export interface GetCourseTasksRequest {
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

export interface GetGroupMembersRequest {
    /** Amount of members per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: GroupMembersSearch | null;
}

export interface GroupMembersSearch {
    login?: string | null;
}

export interface GetUsersRequest {
    /** Amount of users per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: UsersSearch | null;

    filter?: UsersFilter | null;
}

export interface UsersSearch {
    /** User's login filter (case and substring position insensitive) */
    login?: string | null;
}

export interface UsersFilter {
    include?: UsersFilterData | null;

    exclude?: UsersFilterData | null;
}

export interface UsersFilterData {
    id?: string[] | null;

    groupId?: string[] | null;

    role?: UserRole[] | null;
}

export interface GetCoursesRequest {
    /** Amount of courses per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: CoursesSearch | null;

    filter?: CoursesFilter | null;
}

export interface CoursesFilter {
    include?: CoursesFilterData | null;

    exclude?: CoursesFilterData | null;
}

export interface CoursesFilterData {
    id?: string[] | null;
}

export interface GetGroupsRequest {
    /** Amount of courses per page. */
    limit: number;
    /** 1-based page number. */
    page: number;
    /** Search filters. */
    search?: GroupsSearch | null;
}

export interface GroupsSearch {
    name?: string | null;
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

export interface GetGroupRequest {
    /** Target group id. */
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

export interface CreateGroupRequest {
    name: string;
    /** Array of user ids. */
    members?: string[] | null;
    /** Array of courses ids. */
    courses?: string[] | null;
}

export interface UpdateGroupRequest {
    /** Target group id. */
    id: string;
    /** Update payload. */
    patch: UpdateGroupPatch;
}

export interface UpdateGroupPatch {
    name?: string | null;

    addMembers?: string[] | null;

    addCourses?: string[] | null;

    removeMembers?: string[] | null;

    removeCourses?: string[] | null;
}

export interface DeleteGroupRequest {
    /** Target group id. */
    id: string;
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

export interface DeleteTaskRequest {
    /** Target task id. */
    id: string;
}

export interface DeleteCourseRequest {
    /** Target course id. */
    id: string;
}

export interface DeleteUserRequest {
    /** Target user id. */
    id: string;
}
/** Represents an academic task type, currently it has no special meaning. */
export enum TaskType {
    Homework = "homework",
    Lab = "lab",
    Test = "test",
    Exam = "exam"
}
/** User role limits access for some resources.See @deny and @access directives for each endpoint.By default, if no such directive is applied, the endpoint is freely accessible. */
export enum UserRole {
    Guest = "guest",
    Student = "student",
    Teacher = "teacher",
    Admin = "admin"
}

/** Bson ObjectId format compliant string, i.e. 24 hexadecimal characters. */
export type Boid = string;

/** ISO-8601 format compliant date-time string. */
export type Date = string;

export type TypeMatchedScalar = any;

// ====================================================
// Documents
// ====================================================

export namespace CreateGroup {
    export type Variables = {
        req: CreateGroupRequest;
    };

    export type Mutation = {
        __typename?: "Mutation";

        createGroup: CreateGroup;
    };

    export type CreateGroup = {
        __typename?: "CreateGroupResponse";

        group: Group;
    };

    export type Group = {
        __typename?: "Group";

        id: string;
    };
}

export namespace DeleteGroup {
    export type Variables = {
        req: DeleteGroupRequest;
    };

    export type Mutation = {
        __typename?: "Mutation";

        deleteGroup: DeleteGroup;
    };

    export type DeleteGroup = {
        __typename?: "DeleteGroupResponse";

        group: Group;
    };

    export type Group = {
        __typename?: "Group";

        id: string;
    };
}

export namespace UpdateGroup {
    export type Variables = {
        req: UpdateGroupRequest;
    };

    export type Mutation = {
        __typename?: "Mutation";

        updateGroup: UpdateGroup;
    };

    export type UpdateGroup = {
        __typename?: "UpdateGroupResponse";

        group: Group;
    };

    export type Group = {
        __typename?: "Group";

        id: string;
    };
}

export namespace GetGroup {
    export type Variables = {
        groupReq: GetGroupRequest;
        membersReq: GetGroupMembersRequest;
    };

    export type Query = {
        __typename?: "Query";

        getGroup: GetGroup;
    };

    export type GetGroup = {
        __typename?: "GetGroupResponse";

        group: Group;
    };

    export type Group = {
        __typename?: "Group";

        name: string;

        creationDate: string;

        getMembers: GetMembers;
    };

    export type GetMembers = {
        __typename?: "GetGroupMembersResponse";

        total: number;

        data: Data[];
    };

    export type Data = {
        __typename?: "User";

        id: string;

        login: string;

        fullname: string;

        role: UserRole;

        avaUrl: string;
    };
}

export namespace GetGroups {
    export type Variables = {
        req: GetGroupsRequest;
    };

    export type Query = {
        __typename?: "Query";

        getGroups: GetGroups;
    };

    export type GetGroups = {
        __typename?: "GetGroupsResponse";

        total: number;

        data: Data[];
    };

    export type Data = {
        __typename?: "Group";

        id: string;

        name: string;

        getMembers: GetMembers;
    };

    export type GetMembers = {
        __typename?: "GetGroupMembersResponse";

        total: number;
    };
}

export namespace GetCourse {
    export type Variables = {
        courseReq: GetCourseRequest;
        tasksReq: GetCourseTasksRequest;
    };

    export type Query = {
        __typename?: "Query";

        getCourse: GetCourse;
    };

    export type GetCourse = {
        __typename?: "GetCourseResponse";

        course: Course;
    };

    export type Course = {
        __typename?: "Course";

        description: string;

        name: string;

        publicationDate: string;

        getTasks: GetTasks;
    };

    export type GetTasks = {
        __typename?: "GetCourseTasksResponse";

        total: number;

        data: Data[];
    };

    export type Data = {
        __typename?: "Task";

        id: string;

        taskType: TaskType;

        title: string;

        maxMark: number;
    };
}

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
        __typename?: "GetUserResponse";

        user: User;
    };

    export type User = {
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
export class CreateGroupGQL extends Apollo.Mutation<
    CreateGroup.Mutation,
    CreateGroup.Variables
> {
    document: any = gql`
        mutation createGroup($req: CreateGroupRequest!) {
            createGroup(req: $req) {
                group {
                    id
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class DeleteGroupGQL extends Apollo.Mutation<
    DeleteGroup.Mutation,
    DeleteGroup.Variables
> {
    document: any = gql`
        mutation deleteGroup($req: DeleteGroupRequest!) {
            deleteGroup(req: $req) {
                group {
                    id
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class UpdateGroupGQL extends Apollo.Mutation<
    UpdateGroup.Mutation,
    UpdateGroup.Variables
> {
    document: any = gql`
        mutation updateGroup($req: UpdateGroupRequest!) {
            updateGroup(req: $req) {
                group {
                    id
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class GetGroupGQL extends Apollo.Query<
    GetGroup.Query,
    GetGroup.Variables
> {
    document: any = gql`
        query getGroup(
            $groupReq: GetGroupRequest!
            $membersReq: GetGroupMembersRequest!
        ) {
            getGroup(req: $groupReq) {
                group {
                    name
                    creationDate
                    getMembers(req: $membersReq) {
                        total
                        data {
                            id
                            login
                            fullname
                            role
                            avaUrl
                        }
                    }
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class GetGroupsGQL extends Apollo.Query<
    GetGroups.Query,
    GetGroups.Variables
> {
    document: any = gql`
        query getGroups($req: GetGroupsRequest!) {
            getGroups(req: $req) {
                total
                data {
                    id
                    name
                    getMembers(req: { limit: 0, page: 1 }) {
                        total
                    }
                }
            }
        }
    `;
}
@Injectable({
    providedIn: "root"
})
export class GetCourseGQL extends Apollo.Query<
    GetCourse.Query,
    GetCourse.Variables
> {
    document: any = gql`
        query getCourse(
            $courseReq: GetCourseRequest!
            $tasksReq: GetCourseTasksRequest!
        ) {
            getCourse(req: $courseReq) {
                course {
                    description
                    name
                    publicationDate
                    getTasks(req: $tasksReq) {
                        total
                        data {
                            id
                            taskType
                            title
                            maxMark
                        }
                    }
                }
            }
        }
    `;
}
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
                user {
                    id
                    login
                    role
                    fullname
                    registeredAt
                    avaUrl
                    isDisabled
                }
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
