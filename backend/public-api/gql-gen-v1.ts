export interface GetUsersRequest {
  limit: number;

  page: number;

  search?: UsersSearch | null;
}

export interface UsersSearch {
  login?: string | null;
}

export interface GetCoursesRequest {
  limit: number;

  page: number;

  search?: CoursesSearch | null;
}

export interface CoursesSearch {
  name?: string | null;
}

export interface GetTasksRequest {
  page: number;

  limit: number;

  search?: TasksSearch | null;
}

export interface TasksSearch {
  title?: string | null;
}

export interface GetUserRequest {
  id: string;
}

export interface GetTaskRequest {
  id: string;
}

export interface GetCourseRequest {
  id: string;
}

export interface CreateTaskRequest {
  courseId: string;

  taskType: TaskType;

  title: string;

  body: string;

  attachedFileUrl?: string | null;

  maxMark: number;
}

export interface CreateCourseRequest {
  description: string;

  name: string;
}

export interface UpdateMeRequest {
  patch: UpdateMePatch;
}

export interface UpdateMePatch {
  fullname?: string | null;

  avaUrl?: string | null;
}

export interface UpdateUserRequest {
  id: string;

  patch: UpdateUserPatch;
}

export interface UpdateUserPatch {
  role?: UserRole | null;

  fullname?: string | null;
  /** password:      String */
  avaUrl?: string | null;

  isDisabled?: boolean | null;
}

export interface UpdateTaskRequest {
  id: string;

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
  id: string;

  patch: CourseUpdatePatch;
}

export interface CourseUpdatePatch {
  description?: string | null;

  name?: string | null;
}

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteTaskRequest {
  id: string;
}

export interface DeleteCourseRequest {
  id: string;
}

export enum UserRole {
  Guest = "guest",
  Student = "student",
  Teacher = "teacher",
  Admin = "admin"
}

export enum TaskType {
  Homework = "homework",
  Lab = "lab",
  Test = "test",
  Exam = "exam"
}

export type Boid = string;

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  me: User;

  getUsers: GetUsersResponse;

  getCourses: GetCoursesResponse;

  getUser: User;

  getTask: Task;

  getCourse: Course;
}

export interface User {
  id: string;

  login: string;

  role: UserRole;

  fullname: string;

  registeredAt: Date;

  avaUrl?: string | null;

  isDisabled: boolean;
}

export interface GetUsersResponse {
  data: User[];

  total: number;
}

export interface GetCoursesResponse {
  data: Course[];

  total: number;
}

export interface Course {
  id: string;

  authorId: string;

  author: User;

  description: string;

  name: string;

  publicationDate: Date;

  getTasks: GetTasksResponse;
}

export interface GetTasksResponse {
  data: Task[];

  total: number;
}

export interface Task {
  id: string;

  courseId: string;

  authorId: string;

  publicationDate: Date;

  taskType: TaskType;

  title: string;

  body: string;

  attachedFileUrl?: string | null;

  maxMark: number;

  author: User;

  course: Course;
}

export interface Mutation {
  createTask: CreateTaskResponse;

  createCourse: CourseCreateResponse;

  updateMe: UpdateMeResponse;

  updateUser: UpdateUserResponse;

  updateTask: UpdateTaskResponse;

  updateCourse: UpdateCourseResponse;

  deleteUser: DeleteUserResponse;

  deleteTask: DeleteTaskResponse;

  deleteCourse: DeleteCourseResponse;
}

export interface CreateTaskResponse {
  task: Task;
}

export interface CourseCreateResponse {
  course: Course;
}

export interface UpdateMeResponse {
  me: User;
}

export interface UpdateUserResponse {
  user: User;
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface UpdateCourseResponse {
  course: Course;
}

export interface DeleteUserResponse {
  user: User;
}

export interface DeleteTaskResponse {
  task: Task;
}

export interface DeleteCourseResponse {
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
export interface GetUserQueryArgs {
  req: GetUserRequest;
}
export interface GetTaskQueryArgs {
  req: GetTaskRequest;
}
export interface GetCourseQueryArgs {
  req: GetCourseRequest;
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
