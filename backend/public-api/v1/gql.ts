export * from "./gql-extras";

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
/** Get paginated array of task results. */
export interface GetTaskResultsRequest {
  /** Amount of task results per page. */
  limit: number;
  /** 1-based page number. */
  page: number;
  /** Search filters. */
  search?: TaskResultsSearch | null;
}

export interface TaskResultsSearch {
  taskTitle?: string | null;
}
/** Get task result by id. */
export interface GetTaskResultRequest {
  id: string;
}
/** ReadGet task result by its author and taks ids. */
export interface GetUserTaskResultRequest {
  authorId: string;

  taskId: string;
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

  groupId?: (string | null)[] | null;

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

  groupId?: string | null;
}

export interface UpdateTaskRequest {
  /** Target task id. */
  id: string;
  /** Payload of the data to update. */
  patch: UpdateTaskRequestPatch;
}

export interface UpdateTaskRequestPatch {
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
/** Create */
export interface CreateTaskResultRequest {
  taskId: string;

  body?: string | null;

  fileUrl?: string | null;
}
/** Update */
export interface UpdateTaskResultRequest {
  id: string;

  patch: UpdateTaskResultPatch;
}

export interface UpdateTaskResultPatch {
  taskId?: string | null;

  body?: string | null;

  fileUrl?: string | null;
}
/** Delete */
export interface DeleteTaskResultRequest {
  id: string;
}
/** ##TaskResultCheckCreate */
export interface CreateTaskResultCheckRequest {
  id: string;

  payload: CreateTaskResultCheckRequestPayload;
}

export interface CreateTaskResultCheckRequestPayload {
  comment?: string | null;

  score: number;
}
/** Update */
export interface UpdateTaskResultCheckRequest {
  /** Task result id */
  id: string;

  patch: UpdateTaskResultCheckPatch;
}

export interface UpdateTaskResultCheckPatch {
  comment?: string | null;

  score?: number | null;
}

export interface DeleteTaskResultCheckRequest {
  /** Task result id */
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

export type TypeMatchedScalar = any;

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

  getTaskResults: GetTaskResultsResponse;

  getTaskResult: GetTaskResultResponse;

  getUserTaskResult: GetUserTaskResultResponse;
  /** Returns a paginated array of users according to the given page and search arguments. */
  getUsers: GetUsersResponse;
  /** Returns a paginated array of courses according to the given page and search arguments. */
  getCourses: GetCoursesResponse;
  /** Returns a paginated array of courses according to the given page and search arguments. */
  getGroups: GetGroupsResponse;
  /** Returns a single user by id, throws an error if it was not found. */
  getUser: GetUserResponse;
  /** Returns a single task by id, throws an error if it was not found. */
  getTask: GetTaskResponse;
  /** Returns a single course by id, throws an error if it was not found. */
  getCourse: GetCourseResponse;
  /** Returns a single group by id, throws an error if it was not found. */
  getGroup: GetGroupResponse;
}

export interface User {
  /** Unique user identifier. */
  id: string;
  /** Id of the group this user is assigned to. */
  groupId?: string | null;
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
  id: string;

  name: string;
  /** Date when this group was created */
  creationDate: Date;
  /** Returns a paginated array of courses accessible by this group,according to the given page and search arguments. */
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
  id: string;
  /** Course creator user id. */
  authorId: string;
  /** User, that created this course (course.author.id === course.authorId)Use authorId if rather than author.id, as it is much fuster to query. */
  author: User;
  /** Course description written in markdown language. */
  description: string;
  /** A short and laconic header for the course. */
  name: string;
  /** Date when this course was created on the server. */
  publicationDate: Date;
  /** Returns a paginated array of tasks of this course according to the given page and search arguments. */
  getTasks: GetCourseTasksResponse;
}

export interface GetCourseTasksResponse {
  /** Page of tasks that satisfy input search filters. */
  data: Task[];
  /** Total amount of tasks that may be queried for the given search input. */
  total: number;
}

export interface Task {
  /** Unique task identifier (unique amoung all the tasks of all courses). */
  id: string;
  /** Course id this task is attached to. */
  courseId: string;
  /** Task creator user id. */
  authorId: string;
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

  myTaskResult?: TaskResult | null;
}

/** Task fulfilment result */
export interface TaskResult {
  id: string;

  authorId: string;

  taskId: string;

  author: User;

  task: Task;

  lastUpdate: Date;

  body?: string | null;

  fileUrl?: string | null;

  check?: TaskResultCheck | null;
}

/** Examined task result info */
export interface TaskResultCheck {
  authorId: string;

  author: User;

  lastUpdate: Date;

  comment?: string | null;

  score: number;
}

export interface GetGroupMembersResponse {
  /** Page of members that satisfy input search filters. */
  data: User[];
  /** Total amount of members that may be queried for the given search input. */
  total: number;
}

export interface GetTaskResultsResponse {
  /** Page of task results that satisfy input search filters. */
  data: TaskResult[];
  /** Total amount of task results that may be queried for the given search input. */
  total: number;
}

export interface GetTaskResultResponse {
  taskResult: TaskResult;
}

export interface GetUserTaskResultResponse {
  taskResult: TaskResult;
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

export interface GetUserResponse {
  user: User;
}

export interface GetTaskResponse {
  task: Task;
}

export interface GetCourseResponse {
  course: Course;
}

export interface GetGroupResponse {
  group: Group;
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
  /** Deletes the task by id.Throws an error if the task was not found. */
  deleteTask: DeleteTaskResponse;
  /** Deletes the course by id.Throws an error if the course was not found. */
  deleteCourse: DeleteCourseResponse;

  createTaskResult: CreateTaskResultResponse;

  updateTaskResult: UpdateTaskResultResponse;

  deleteTaskResult: DeleteTaskResultResponse;

  createTaskResultCheck: CreateTaskResultCheckResponse;

  updateTaskResultCheck: UpdateTaskResultCheckResponse;

  deleteTaskResultCheck: DeleteTaskResultCheckResponse;
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

export interface DeleteTaskResponse {
  /** Deleted task. */
  task: Task;
}

export interface DeleteCourseResponse {
  /** Deleted course. */
  course: Course;
}

export interface CreateTaskResultResponse {
  taskResult: TaskResult;
}

export interface UpdateTaskResultResponse {
  taskResult: TaskResult;
}

export interface DeleteTaskResultResponse {
  taskResult: TaskResult;
}

export interface CreateTaskResultCheckResponse {
  taskResult: TaskResult;
}

export interface UpdateTaskResultCheckResponse {
  taskResult: TaskResult;
}

export interface DeleteTaskResultCheckResponse {
  taskResult: TaskResult;
}

export interface DeleteUserResponse {
  /** Deleted user. */
  user: User;
}

// ====================================================
// Arguments
// ====================================================

export interface GetTaskResultsQueryArgs {
  req: GetTaskResultsRequest;
}
export interface GetTaskResultQueryArgs {
  req: GetTaskResultRequest;
}
export interface GetUserTaskResultQueryArgs {
  req: GetUserTaskResultRequest;
}
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
  req: GetCourseTasksRequest;
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
export interface DeleteTaskMutationArgs {
  req: DeleteTaskRequest;
}
export interface DeleteCourseMutationArgs {
  req: DeleteCourseRequest;
}
export interface CreateTaskResultMutationArgs {
  req: CreateTaskResultRequest;
}
export interface UpdateTaskResultMutationArgs {
  req: UpdateTaskResultRequest;
}
export interface DeleteTaskResultMutationArgs {
  req: DeleteTaskResultRequest;
}
export interface CreateTaskResultCheckMutationArgs {
  req: CreateTaskResultCheckRequest;
}
export interface UpdateTaskResultCheckMutationArgs {
  req: UpdateTaskResultCheckRequest;
}
export interface DeleteTaskResultCheckMutationArgs {
  req: DeleteTaskResultCheckRequest;
}

export namespace Access {
  // tslint:disable:no-shadowed-variable
  export const Query = {
    me: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    getTaskResults: new Set([UserRole.Teacher, UserRole.Admin]),
    getTaskResult: new Set([
      UserRole.Student,
      UserRole.Teacher,
      UserRole.Admin
    ]),
    getUserTaskResult: new Set([
      UserRole.Student,
      UserRole.Teacher,
      UserRole.Admin
    ]),
    getUsers: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    getGroups: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    getUser: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    getTask: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    getGroup: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin])
  };
  export const Group = {
    $: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin])
  };
  export const Mutation = {
    createTask: new Set([UserRole.Teacher, UserRole.Admin]),
    createCourse: new Set([UserRole.Teacher, UserRole.Admin]),
    createGroup: new Set([UserRole.Admin]),
    updateGroup: new Set([UserRole.Admin]),
    deleteGroup: new Set([UserRole.Admin]),
    updateMe: new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]),
    updateUser: new Set([UserRole.Admin]),
    updateTask: new Set([UserRole.Teacher, UserRole.Admin]),
    updateCourse: new Set([UserRole.Teacher, UserRole.Admin]),
    deleteTask: new Set([UserRole.Teacher, UserRole.Admin]),
    deleteCourse: new Set([UserRole.Teacher, UserRole.Admin]),
    createTaskResult: new Set([UserRole.Student, UserRole.Admin]),
    updateTaskResult: new Set([UserRole.Student, UserRole.Admin]),
    deleteTaskResult: new Set([UserRole.Admin]),
    createTaskResultCheck: new Set([UserRole.Teacher, UserRole.Admin]),
    updateTaskResultCheck: new Set([UserRole.Teacher, UserRole.Admin]),
    deleteTaskResultCheck: new Set([UserRole.Admin])
  };
  // tslint:enable:no-shadowed-variable
}
