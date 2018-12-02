import * as Mongoose from "mongoose";
import ObjectId = Mongoose.Types.ObjectId;

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
  id: ObjectId;
}

export interface GetTaskRequest {
  /** Target task id. */
  id: ObjectId;
}

export interface GetCourseRequest {
  /** Target course id. */
  id: ObjectId;
}

export interface GetGroupRequest {
  /** Target group id. */
  id: ObjectId;
}
/** Holds the payload of the new task. */
export interface CreateTaskRequest {
  courseId: ObjectId;

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
  members?: ObjectId[] | null;
  /** Array of courses ids. */
  courses?: ObjectId[] | null;
}

export interface UpdateGroupRequest {
  /** Target group id. */
  id: ObjectId;
  /** Update payload. */
  patch: UpdateGroupPatch;
}

export interface UpdateGroupPatch {
  name?: string | null;

  addMembers?: ObjectId[] | null;

  addCourses?: ObjectId[] | null;

  removeMembers?: ObjectId[] | null;

  removeCourses?: ObjectId[] | null;
}

export interface DeleteGroupRequest {
  /** Target group id. */
  id: ObjectId;
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
  id: ObjectId;
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
  id: ObjectId;
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
  id: ObjectId;
  /** Payload of the data to update. */
  patch: CourseUpdatePatch;
}

export interface CourseUpdatePatch {
  description?: string | null;

  name?: string | null;
}

export interface DeleteUserRequest {
  /** Target user id. */
  id: ObjectId;
}

export interface DeleteTaskRequest {
  /** Target task id. */
  id: ObjectId;
}

export interface DeleteCourseRequest {
  /** Target course id. */
  id: ObjectId;
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
export type Boid = ObjectId;

/** ISO-8601 format compliant date-time string. */

export type TypeMatchedScalar = never;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

/** Root queries endpoint. */
export interface Query {
  /** Returns user data assigned to the request issuer, according to the givenbearer token in http 'Authorization' header. */
  me: User;
  /** Returns a paginated array of users according to the given page and search arguments. */
  getUsers: GetUsersResponse;
  /** Returns a paginated array of courses according to the given page and search arguments. */
  getCourses: GetCoursesResponse;
  /** Returns a paginated array of courses according to the given page and search arguments. */
  getGroups: GetGroupsResponse;
  /** Returns a single user by id, throws an error if it was not found. */
  getUser: User;
  /** Returns a single task by id, throws an error if it was not found. */
  getTask: Task;
  /** Returns a single course by id, throws an error if it was not found. */
  getCourse: Course;
  /** Returns a single group by id, throws an error if it was not found. */
  getGroup: Group;
}

export interface User {
  /** Unique user identifier. */
  id: ObjectId;
  /** Id of the group this user is assigned to. */
  groupId?: ObjectId | null;
  /** Group this user is assigned to. */
  group?: Group | null;
  /** Unique user identifier. It is mostly used as a user nickname. */
  login: string;
  /** User's role. Defines it access limits. */
  role: UserRole;
  /** User's real fullname. It schould include a firstname and a lastname. */
  fullname: string;
  /** Date when the user was registered on the server. */
  registeredAt: Date;
  /** User's avatar image url. */
  avaUrl: string;
  /** Flag to define wheter user is banned or not. */
  isDisabled: boolean;
}

/** Represents an academic group of students. */
export interface Group {
  id: ObjectId;

  name: string;
  /** Date when this group was created */
  creationDate: Date;
  /** Returns a paginated array of courses openned accessible by this group,according to the given page and search arguments. */
  getCourses: GetGroupCoursesResponse;

  getMembers: GetGroupMembersResponse;
}

export interface GetGroupCoursesResponse {
  /** Page of courses that satisfy input search filters. */
  data: Course[];
  /** Total amount of courses that may be queried for the given search input. */
  total: number;
}

export interface Course {
  /** Unique course identifier. */
  id: ObjectId;
  /** Course creator user id. */
  authorId: ObjectId;
  /** User, that created this course (course.author.id === course.authorId)Use authorId if rather than author.id, as it is much fuster to query. */
  author: User;
  /** Course description written in markdown language. */
  description: string;
  /** A short and laconic header for the course. */
  name: string;
  /** Date when this course was created on the server. */
  publicationDate: Date;
  /** Returns a paginated array of tasks of this course according to the given page and search arguments. */
  getTasks: GetTasksResponse;
}

export interface GetTasksResponse {
  /** Page of tasks that satisfy input search filters. */
  data: Task[];
  /** Total amount of tasks that may be queried for the given search input. */
  total: number;
}

export interface Task {
  /** Unique task identifier (unique amoung all the tasks of all courses). */
  id: ObjectId;
  /** Course id this task is attached to. */
  courseId: ObjectId;
  /** Task creator user id. */
  authorId: ObjectId;
  /** Date when this task was created on the server. */
  publicationDate: Date;
  /** Task academic type. */
  taskType: TaskType;
  /** A shortand laconic header for the course. */
  title: string;
  /** Task body written in markdown language.It should mention task requirements, execution workflow and useful ad hoc information. */
  body: string;
  /** Url of the file which is atteched to the task, users can download it via the given href. */
  attachedFileUrl?: string | null;
  /** Maximum mark a student can get for fulfilling this task.It has no special meaning currently. */
  maxMark: number;
  /** Task creator user. */
  author: User;
  /** Course this task is attached to. */
  course: Course;
}

export interface GetGroupMembersResponse {
  /** Page of members that satisfy input search filters. */
  data: User[];
  /** Total amount of members that may be queried for the given search input. */
  total: number;
}

export interface GetUsersResponse {
  /** Page of users that satisfy input search filters. */
  data: User[];
  /** Total amount of users that may be queried for the given search input. */
  total: number;
}

export interface GetCoursesResponse {
  /** Page of courses that satisfy input search filters. */
  data: Course[];
  /** Total amount of courses that may be queried for the given search input. */
  total: number;
}

export interface GetGroupsResponse {
  /** Page of courses that satisfy input search filters. */
  data: Group[];
  /** Total amount of courses that may be queried for the given search input. */
  total: number;
}

/** Root mutations endpoint */
export interface Mutation {
  /** Creates a new task with the given input data. */
  createTask: CreateTaskResponse;
  /** Creates a new course with the given input data. */
  createCourse: CourseCreateResponse;

  createGroup: CreateGroupResponse;

  updateGroup: UpdateGroupResponse;

  deleteGroup: DeleteGroupResponse;
  /** Updates request issuer's user with the given input data. */
  updateMe: UpdateMeResponse;
  /** Updates particular user with the given input data.Throws an error if the user was not found. */
  updateUser: UpdateUserResponse;
  /** Updates particular task with the given input data.Throws an error if the task was not found. */
  updateTask: UpdateTaskResponse;
  /** Updates particular course with the given input data.Throws an error if the course was not found. */
  updateCourse: UpdateCourseResponse;
  /** Deletes the user by id.Throws an error if the user was not found. */
  deleteUser: DeleteUserResponse;
  /** Deletes the task by id.Throws an error if the task was not found. */
  deleteTask: DeleteTaskResponse;
  /** Deletes the course by id.Throws an error if the course was not found. */
  deleteCourse: DeleteCourseResponse;
}

export interface CreateTaskResponse {
  /** Created task. */
  task: Task;
}

export interface CourseCreateResponse {
  /** Created course. */
  course: Course;
}

export interface CreateGroupResponse {
  group: Group;
}

export interface UpdateGroupResponse {
  /** Update group. */
  group: Group;
}

export interface DeleteGroupResponse {
  /** Deleted group. */
  group: Group;
}

export interface UpdateMeResponse {
  /** Updated user. */
  me: User;
}

export interface UpdateUserResponse {
  /** Updated user. */
  user: User;
}

export interface UpdateTaskResponse {
  /** Updated task. */
  task: Task;
}

export interface UpdateCourseResponse {
  /** Updated course. */
  course: Course;
}

export interface DeleteUserResponse {
  /** Deleted user. */
  user: User;
}

export interface DeleteTaskResponse {
  /** Deleted task. */
  task: Task;
}

export interface DeleteCourseResponse {
  /** Deleted course. */
  course: Course;
}

// ====================================================
// Arguments
// ====================================================

export interface GetUsersQueryArgs {
  req: GetUsersRequest;
}
export interface GetCoursesQueryArgs {
  req: GetCoursesRequest;
}
export interface GetGroupsQueryArgs {
  req: GetGroupsRequest;
}
export interface GetUserQueryArgs {
  req: GetUserRequest;
}
export interface GetTaskQueryArgs {
  req: GetTaskRequest;
}
export interface GetCourseQueryArgs {
  req: GetCourseRequest;
}
export interface GetGroupQueryArgs {
  req: GetGroupRequest;
}
export interface GetCoursesGroupArgs {
  req: GetGroupCoursesRequest;
}
export interface GetMembersGroupArgs {
  req: GetGroupMembersRequest;
}
export interface GetTasksCourseArgs {
  req: GetTasksRequest;
}
export interface CreateTaskMutationArgs {
  req: CreateTaskRequest;
}
export interface CreateCourseMutationArgs {
  req: CreateCourseRequest;
}
export interface CreateGroupMutationArgs {
  req: CreateGroupRequest;
}
export interface UpdateGroupMutationArgs {
  req: UpdateGroupRequest;
}
export interface DeleteGroupMutationArgs {
  req: DeleteGroupRequest;
}
export interface UpdateMeMutationArgs {
  req: UpdateMeRequest;
}
export interface UpdateUserMutationArgs {
  req: UpdateUserRequest;
}
export interface UpdateTaskMutationArgs {
  req: UpdateTaskRequest;
}
export interface UpdateCourseMutationArgs {
  req: UpdateCourseRequest;
}
export interface DeleteUserMutationArgs {
  req: DeleteUserRequest;
}
export interface DeleteTaskMutationArgs {
  req: DeleteTaskRequest;
}
export interface DeleteCourseMutationArgs {
  req: DeleteCourseRequest;
}

import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from "graphql";

import { Task, Course, Group, User } from "./gql-params-v1";

import { ResolveContext } from "./gql-params-v1";

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<
  Result,
  Parent = {},
  Context = {},
  Args = {}
> =
  | ((
      ...args: any[]
    ) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

type Maybe<T> = T | null | undefined;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Root queries endpoint. */
export namespace QueryResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = {}> {
    /** Returns user data assigned to the request issuer, according to the givenbearer token in http 'Authorization' header. */
    me?: MeResolver<User, TypeParent, Context>;
    /** Returns a paginated array of users according to the given page and search arguments. */
    getUsers?: GetUsersResolver<GetUsersResponse, TypeParent, Context>;
    /** Returns a paginated array of courses according to the given page and search arguments. */
    getCourses?: GetCoursesResolver<GetCoursesResponse, TypeParent, Context>;
    /** Returns a paginated array of courses according to the given page and search arguments. */
    getGroups?: GetGroupsResolver<GetGroupsResponse, TypeParent, Context>;
    /** Returns a single user by id, throws an error if it was not found. */
    getUser?: GetUserResolver<User, TypeParent, Context>;
    /** Returns a single task by id, throws an error if it was not found. */
    getTask?: GetTaskResolver<Task, TypeParent, Context>;
    /** Returns a single course by id, throws an error if it was not found. */
    getCourse?: GetCourseResolver<Course, TypeParent, Context>;
    /** Returns a single group by id, throws an error if it was not found. */
    getGroup?: GetGroupResolver<Group, TypeParent, Context>;
  }

  export type MeResolver<
    R = User,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type GetUsersResolver<
    R = GetUsersResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetUsersArgs>;
  export interface GetUsersArgs {
    req: GetUsersRequest;
  }

  export type GetCoursesResolver<
    R = GetCoursesResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetCoursesArgs>;
  export interface GetCoursesArgs {
    req: GetCoursesRequest;
  }

  export type GetGroupsResolver<
    R = GetGroupsResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetGroupsArgs>;
  export interface GetGroupsArgs {
    req: GetGroupsRequest;
  }

  export type GetUserResolver<
    R = User,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetUserArgs>;
  export interface GetUserArgs {
    req: GetUserRequest;
  }

  export type GetTaskResolver<
    R = Task,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetTaskArgs>;
  export interface GetTaskArgs {
    req: GetTaskRequest;
  }

  export type GetCourseResolver<
    R = Course,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetCourseArgs>;
  export interface GetCourseArgs {
    req: GetCourseRequest;
  }

  export type GetGroupResolver<
    R = Group,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetGroupArgs>;
  export interface GetGroupArgs {
    req: GetGroupRequest;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = User> {
    /** Unique user identifier. */
    id?: IdResolver<ObjectId, TypeParent, Context>;
    /** Id of the group this user is assigned to. */
    groupId?: GroupIdResolver<ObjectId | null, TypeParent, Context>;
    /** Group this user is assigned to. */
    group?: GroupResolver<Group | null, TypeParent, Context>;
    /** Unique user identifier. It is mostly used as a user nickname. */
    login?: LoginResolver<string, TypeParent, Context>;
    /** User's role. Defines it access limits. */
    role?: RoleResolver<UserRole, TypeParent, Context>;
    /** User's real fullname. It schould include a firstname and a lastname. */
    fullname?: FullnameResolver<string, TypeParent, Context>;
    /** Date when the user was registered on the server. */
    registeredAt?: RegisteredAtResolver<Date, TypeParent, Context>;
    /** User's avatar image url. */
    avaUrl?: AvaUrlResolver<string, TypeParent, Context>;
    /** Flag to define wheter user is banned or not. */
    isDisabled?: IsDisabledResolver<boolean, TypeParent, Context>;
  }

  export type IdResolver<
    R = ObjectId,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type GroupIdResolver<
    R = ObjectId | null,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type GroupResolver<
    R = Group | null,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type LoginResolver<
    R = string,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type RoleResolver<
    R = UserRole,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type FullnameResolver<
    R = string,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type RegisteredAtResolver<
    R = Date,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AvaUrlResolver<
    R = string,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type IsDisabledResolver<
    R = boolean,
    Parent = User,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}
/** Represents an academic group of students. */
export namespace GroupResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = Group> {
    id?: IdResolver<ObjectId, TypeParent, Context>;

    name?: NameResolver<string, TypeParent, Context>;
    /** Date when this group was created */
    creationDate?: CreationDateResolver<Date, TypeParent, Context>;
    /** Returns a paginated array of courses openned accessible by this group,according to the given page and search arguments. */
    getCourses?: GetCoursesResolver<
      GetGroupCoursesResponse,
      TypeParent,
      Context
    >;

    getMembers?: GetMembersResolver<
      GetGroupMembersResponse,
      TypeParent,
      Context
    >;
  }

  export type IdResolver<
    R = ObjectId,
    Parent = Group,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = string,
    Parent = Group,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type CreationDateResolver<
    R = Date,
    Parent = Group,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type GetCoursesResolver<
    R = GetGroupCoursesResponse,
    Parent = Group,
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetCoursesArgs>;
  export interface GetCoursesArgs {
    req: GetGroupCoursesRequest;
  }

  export type GetMembersResolver<
    R = GetGroupMembersResponse,
    Parent = Group,
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetMembersArgs>;
  export interface GetMembersArgs {
    req: GetGroupMembersRequest;
  }
}

export namespace GetGroupCoursesResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetGroupCoursesResponse
  > {
    /** Page of courses that satisfy input search filters. */
    data?: DataResolver<Course[], TypeParent, Context>;
    /** Total amount of courses that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = Course[],
    Parent = GetGroupCoursesResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetGroupCoursesResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace CourseResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = Course> {
    /** Unique course identifier. */
    id?: IdResolver<ObjectId, TypeParent, Context>;
    /** Course creator user id. */
    authorId?: AuthorIdResolver<ObjectId, TypeParent, Context>;
    /** User, that created this course (course.author.id === course.authorId)Use authorId if rather than author.id, as it is much fuster to query. */
    author?: AuthorResolver<User, TypeParent, Context>;
    /** Course description written in markdown language. */
    description?: DescriptionResolver<string, TypeParent, Context>;
    /** A short and laconic header for the course. */
    name?: NameResolver<string, TypeParent, Context>;
    /** Date when this course was created on the server. */
    publicationDate?: PublicationDateResolver<Date, TypeParent, Context>;
    /** Returns a paginated array of tasks of this course according to the given page and search arguments. */
    getTasks?: GetTasksResolver<GetTasksResponse, TypeParent, Context>;
  }

  export type IdResolver<
    R = ObjectId,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AuthorIdResolver<
    R = ObjectId,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AuthorResolver<
    R = User,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type DescriptionResolver<
    R = string,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type NameResolver<
    R = string,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type PublicationDateResolver<
    R = Date,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type GetTasksResolver<
    R = GetTasksResponse,
    Parent = Course,
    Context = ResolveContext
  > = Resolver<R, Parent, Context, GetTasksArgs>;
  export interface GetTasksArgs {
    req: GetTasksRequest;
  }
}

export namespace GetTasksResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetTasksResponse
  > {
    /** Page of tasks that satisfy input search filters. */
    data?: DataResolver<Task[], TypeParent, Context>;
    /** Total amount of tasks that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = Task[],
    Parent = GetTasksResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetTasksResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace TaskResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = Task> {
    /** Unique task identifier (unique amoung all the tasks of all courses). */
    id?: IdResolver<ObjectId, TypeParent, Context>;
    /** Course id this task is attached to. */
    courseId?: CourseIdResolver<ObjectId, TypeParent, Context>;
    /** Task creator user id. */
    authorId?: AuthorIdResolver<ObjectId, TypeParent, Context>;
    /** Date when this task was created on the server. */
    publicationDate?: PublicationDateResolver<Date, TypeParent, Context>;
    /** Task academic type. */
    taskType?: TaskTypeResolver<TaskType, TypeParent, Context>;
    /** A shortand laconic header for the course. */
    title?: TitleResolver<string, TypeParent, Context>;
    /** Task body written in markdown language.It should mention task requirements, execution workflow and useful ad hoc information. */
    body?: BodyResolver<string, TypeParent, Context>;
    /** Url of the file which is atteched to the task, users can download it via the given href. */
    attachedFileUrl?: AttachedFileUrlResolver<
      string | null,
      TypeParent,
      Context
    >;
    /** Maximum mark a student can get for fulfilling this task.It has no special meaning currently. */
    maxMark?: MaxMarkResolver<number, TypeParent, Context>;
    /** Task creator user. */
    author?: AuthorResolver<User, TypeParent, Context>;
    /** Course this task is attached to. */
    course?: CourseResolver<Course, TypeParent, Context>;
  }

  export type IdResolver<
    R = ObjectId,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type CourseIdResolver<
    R = ObjectId,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AuthorIdResolver<
    R = ObjectId,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type PublicationDateResolver<
    R = Date,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TaskTypeResolver<
    R = TaskType,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TitleResolver<
    R = string,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type BodyResolver<
    R = string,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AttachedFileUrlResolver<
    R = string | null,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type MaxMarkResolver<
    R = number,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type AuthorResolver<
    R = User,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type CourseResolver<
    R = Course,
    Parent = Task,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace GetGroupMembersResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetGroupMembersResponse
  > {
    /** Page of members that satisfy input search filters. */
    data?: DataResolver<User[], TypeParent, Context>;
    /** Total amount of members that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = User[],
    Parent = GetGroupMembersResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetGroupMembersResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace GetUsersResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetUsersResponse
  > {
    /** Page of users that satisfy input search filters. */
    data?: DataResolver<User[], TypeParent, Context>;
    /** Total amount of users that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = User[],
    Parent = GetUsersResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetUsersResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace GetCoursesResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetCoursesResponse
  > {
    /** Page of courses that satisfy input search filters. */
    data?: DataResolver<Course[], TypeParent, Context>;
    /** Total amount of courses that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = Course[],
    Parent = GetCoursesResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetCoursesResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace GetGroupsResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = GetGroupsResponse
  > {
    /** Page of courses that satisfy input search filters. */
    data?: DataResolver<Group[], TypeParent, Context>;
    /** Total amount of courses that may be queried for the given search input. */
    total?: TotalResolver<number, TypeParent, Context>;
  }

  export type DataResolver<
    R = Group[],
    Parent = GetGroupsResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
  export type TotalResolver<
    R = number,
    Parent = GetGroupsResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}
/** Root mutations endpoint */
export namespace MutationResolvers {
  export interface Resolvers<Context = ResolveContext, TypeParent = {}> {
    /** Creates a new task with the given input data. */
    createTask?: CreateTaskResolver<CreateTaskResponse, TypeParent, Context>;
    /** Creates a new course with the given input data. */
    createCourse?: CreateCourseResolver<
      CourseCreateResponse,
      TypeParent,
      Context
    >;

    createGroup?: CreateGroupResolver<CreateGroupResponse, TypeParent, Context>;

    updateGroup?: UpdateGroupResolver<UpdateGroupResponse, TypeParent, Context>;

    deleteGroup?: DeleteGroupResolver<DeleteGroupResponse, TypeParent, Context>;
    /** Updates request issuer's user with the given input data. */
    updateMe?: UpdateMeResolver<UpdateMeResponse, TypeParent, Context>;
    /** Updates particular user with the given input data.Throws an error if the user was not found. */
    updateUser?: UpdateUserResolver<UpdateUserResponse, TypeParent, Context>;
    /** Updates particular task with the given input data.Throws an error if the task was not found. */
    updateTask?: UpdateTaskResolver<UpdateTaskResponse, TypeParent, Context>;
    /** Updates particular course with the given input data.Throws an error if the course was not found. */
    updateCourse?: UpdateCourseResolver<
      UpdateCourseResponse,
      TypeParent,
      Context
    >;
    /** Deletes the user by id.Throws an error if the user was not found. */
    deleteUser?: DeleteUserResolver<DeleteUserResponse, TypeParent, Context>;
    /** Deletes the task by id.Throws an error if the task was not found. */
    deleteTask?: DeleteTaskResolver<DeleteTaskResponse, TypeParent, Context>;
    /** Deletes the course by id.Throws an error if the course was not found. */
    deleteCourse?: DeleteCourseResolver<
      DeleteCourseResponse,
      TypeParent,
      Context
    >;
  }

  export type CreateTaskResolver<
    R = CreateTaskResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, CreateTaskArgs>;
  export interface CreateTaskArgs {
    req: CreateTaskRequest;
  }

  export type CreateCourseResolver<
    R = CourseCreateResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, CreateCourseArgs>;
  export interface CreateCourseArgs {
    req: CreateCourseRequest;
  }

  export type CreateGroupResolver<
    R = CreateGroupResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, CreateGroupArgs>;
  export interface CreateGroupArgs {
    req: CreateGroupRequest;
  }

  export type UpdateGroupResolver<
    R = UpdateGroupResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, UpdateGroupArgs>;
  export interface UpdateGroupArgs {
    req: UpdateGroupRequest;
  }

  export type DeleteGroupResolver<
    R = DeleteGroupResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, DeleteGroupArgs>;
  export interface DeleteGroupArgs {
    req: DeleteGroupRequest;
  }

  export type UpdateMeResolver<
    R = UpdateMeResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, UpdateMeArgs>;
  export interface UpdateMeArgs {
    req: UpdateMeRequest;
  }

  export type UpdateUserResolver<
    R = UpdateUserResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, UpdateUserArgs>;
  export interface UpdateUserArgs {
    req: UpdateUserRequest;
  }

  export type UpdateTaskResolver<
    R = UpdateTaskResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, UpdateTaskArgs>;
  export interface UpdateTaskArgs {
    req: UpdateTaskRequest;
  }

  export type UpdateCourseResolver<
    R = UpdateCourseResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, UpdateCourseArgs>;
  export interface UpdateCourseArgs {
    req: UpdateCourseRequest;
  }

  export type DeleteUserResolver<
    R = DeleteUserResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, DeleteUserArgs>;
  export interface DeleteUserArgs {
    req: DeleteUserRequest;
  }

  export type DeleteTaskResolver<
    R = DeleteTaskResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, DeleteTaskArgs>;
  export interface DeleteTaskArgs {
    req: DeleteTaskRequest;
  }

  export type DeleteCourseResolver<
    R = DeleteCourseResponse,
    Parent = {},
    Context = ResolveContext
  > = Resolver<R, Parent, Context, DeleteCourseArgs>;
  export interface DeleteCourseArgs {
    req: DeleteCourseRequest;
  }
}

export namespace CreateTaskResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = CreateTaskResponse
  > {
    /** Created task. */
    task?: TaskResolver<Task, TypeParent, Context>;
  }

  export type TaskResolver<
    R = Task,
    Parent = CreateTaskResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace CourseCreateResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = CourseCreateResponse
  > {
    /** Created course. */
    course?: CourseResolver<Course, TypeParent, Context>;
  }

  export type CourseResolver<
    R = Course,
    Parent = CourseCreateResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace CreateGroupResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = CreateGroupResponse
  > {
    group?: GroupResolver<Group, TypeParent, Context>;
  }

  export type GroupResolver<
    R = Group,
    Parent = CreateGroupResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace UpdateGroupResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = UpdateGroupResponse
  > {
    /** Update group. */
    group?: GroupResolver<Group, TypeParent, Context>;
  }

  export type GroupResolver<
    R = Group,
    Parent = UpdateGroupResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace DeleteGroupResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = DeleteGroupResponse
  > {
    /** Deleted group. */
    group?: GroupResolver<Group, TypeParent, Context>;
  }

  export type GroupResolver<
    R = Group,
    Parent = DeleteGroupResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace UpdateMeResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = UpdateMeResponse
  > {
    /** Updated user. */
    me?: MeResolver<User, TypeParent, Context>;
  }

  export type MeResolver<
    R = User,
    Parent = UpdateMeResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace UpdateUserResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = UpdateUserResponse
  > {
    /** Updated user. */
    user?: UserResolver<User, TypeParent, Context>;
  }

  export type UserResolver<
    R = User,
    Parent = UpdateUserResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace UpdateTaskResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = UpdateTaskResponse
  > {
    /** Updated task. */
    task?: TaskResolver<Task, TypeParent, Context>;
  }

  export type TaskResolver<
    R = Task,
    Parent = UpdateTaskResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace UpdateCourseResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = UpdateCourseResponse
  > {
    /** Updated course. */
    course?: CourseResolver<Course, TypeParent, Context>;
  }

  export type CourseResolver<
    R = Course,
    Parent = UpdateCourseResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace DeleteUserResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = DeleteUserResponse
  > {
    /** Deleted user. */
    user?: UserResolver<User, TypeParent, Context>;
  }

  export type UserResolver<
    R = User,
    Parent = DeleteUserResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace DeleteTaskResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = DeleteTaskResponse
  > {
    /** Deleted task. */
    task?: TaskResolver<Task, TypeParent, Context>;
  }

  export type TaskResolver<
    R = Task,
    Parent = DeleteTaskResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

export namespace DeleteCourseResponseResolvers {
  export interface Resolvers<
    Context = ResolveContext,
    TypeParent = DeleteCourseResponse
  > {
    /** Deleted course. */
    course?: CourseResolver<Course, TypeParent, Context>;
  }

  export type CourseResolver<
    R = Course,
    Parent = DeleteCourseResponse,
    Context = ResolveContext
  > = Resolver<R, Parent, Context>;
}

/** Denies access to an object or field for the users with the given roles. */
export type DenyDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DenyDirectiveArgs,
  ResolveContext
>;
export interface DenyDirectiveArgs {
  roles?: (UserRole | null)[] | null;
}

/** Grants access to an object or field only for the users with the given roles. */
export type AllowDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  AllowDirectiveArgs,
  ResolveContext
>;
export interface AllowDirectiveArgs {
  roles?: (UserRole | null)[] | null;
}

/** Requires a string to contain at least one non-whitespace character. */
export type NotEmptyDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires an integer within the range [1, +Infinity) */
export type PositiveIntDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires an integer within the range [0, +Infinity) */
export type ZeroOrPositiveIntDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires a number within the range [0, +Infinity) */
export type ZeroOrPositiveNumberDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires a specific login string format, which is /^[A-Za-z\d_-]{4,32}$/ */
export type LoginDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires a specific password string format, which is /^\S{6,32}$/ */
export type PasswordDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Requires a specific user fullname string format, wich is /^\S{3,32}$/ */
export type UserFullnameDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  {},
  ResolveContext
>; /** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  SkipDirectiveArgs,
  ResolveContext
>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  ResolveContext
>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  ResolveContext
>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string | null;
}

export interface BOIDScalarConfig extends GraphQLScalarTypeConfig<Boid, any> {
  name: "BOID";
}
export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: "Date";
}
export interface TypeMatchedScalarScalarConfig
  extends GraphQLScalarTypeConfig<TypeMatchedScalar, any> {
  name: "TypeMatchedScalar";
}
