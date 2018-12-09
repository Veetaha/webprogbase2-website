"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vts = require("vee-type-safe");
const HttpCodes = require("http-status-codes");
const GqlGen = require("./gql");
var Data;
(function (Data) {
    let User;
    (function (User) {
        User.Role = GqlGen.UserRole;
        class Credential {
            constructor(regexp, formatHint, name, minLength, maxLength) {
                this.regexp = regexp;
                this.formatHint = formatHint;
                this.name = name;
                this.minLength = minLength;
                this.maxLength = maxLength;
            }
            isValid(credential) {
                return this.regexp.test(credential);
            }
            invalidErrorMessage() {
                return `invalid ${this.name}`;
            }
        }
        User.Credential = Credential;
        User.Password = new Credential(/^\S{6,32}$/, 'only nonspace characters', 'password', 6, 32);
        User.Login = new Credential(/^[A-Za-z\d_-]{4,32}$/, '[A-Za-z0-9_-]', 'login', 4, 32);
        User.Fullname = new Credential(/^\S{3,32}$/, 'only nonspace characters', 'fullname', 3, 32);
        User.JsonTD = {
            id: Vts.isBsonObjectIdString,
            login: User.Login.regexp,
            registeredAt: Vts.isIsoDateString,
            group: Vts.isNullOr(Vts.isBsonObjectIdString),
            fullname: User.Fullname.regexp,
            role: Vts.isInEnum(User.Role),
            avaUrl: 'string',
            isDisabled: 'boolean'
        };
    })(User = Data.User || (Data.User = {}));
    let Task;
    (function (Task) {
        Task.Type = GqlGen.TaskType;
    })(Task = Data.Task || (Data.Task = {}));
    Data.JwtPayloadTD = {
        sub: Vts.isBsonObjectIdString,
        iat: Vts.isZeroOrPositiveInteger,
        exp: Vts.isZeroOrPositiveInteger
    };
})(Data = exports.Data || (exports.Data = {}));
var UserRole = Data.User.Role;
exports.UserRole = Data.User.Role;
exports.TaskType = Data.Task.Type;
function isStringifiedPositiveInteger(suspect) {
    return Vts.isPositiveInteger(Number(suspect));
}
exports.PaginationQParamsGetRequestTD = {
    page: isStringifiedPositiveInteger,
    limit: isStringifiedPositiveInteger,
    search: Vts.optional('string')
};
// export interface TasksGetResponse   extends PaginatedResponse<TaskGetResponse>      {}
// tslint:disable:no-shadowed-variable
var Routes;
(function (Routes) {
    Routes.$ = '';
    Routes._ = '';
    let Auth;
    (function (Auth) {
        Auth.$ = '/auth';
        Auth._ = `${Routes._}${Auth.$}`;
        // POST ONLY
        let Login;
        (function (Login) {
            let Post;
            (function (Post) {
                Post.$ = '/login';
                Post._ = `${Routes.Auth._}${Post.$}`;
                Post.RequestTD = {
                    login: Data.User.Login.regexp,
                    password: Data.User.Password.regexp
                };
                let Response;
                (function (Response) {
                    Response.FailureStatus = HttpCodes.EXPECTATION_FAILED;
                    Response.FailureTD = {
                        failure: 'string'
                    };
                })(Response = Post.Response || (Post.Response = {}));
            })(Post = Login.Post || (Login.Post = {}));
        })(Login = Auth.Login || (Auth.Login = {}));
        let Register;
        (function (Register) {
            let Post;
            (function (Post) {
                Post.$ = '/register';
                Post._ = `${Routes.Auth._}${Post.$}`;
                Post.RequestTD = {
                    login: Data.User.Login.regexp,
                    password: Data.User.Password.regexp,
                    fullname: Data.User.Fullname.regexp,
                    avaUrl: Vts.optional('string')
                };
                let Response;
                (function (Response) {
                    Response.SuccessTD = {
                        jwt: 'string'
                    };
                    Response.FailureTD = {
                        failure: 'string'
                    };
                    Response.FailureStatus = HttpCodes.EXPECTATION_FAILED;
                })(Response = Post.Response || (Post.Response = {}));
            })(Post = Register.Post || (Register.Post = {}));
        })(Register = Auth.Register || (Auth.Register = {}));
        // export namespace Logout { export namespace Post {
        //     export const $ = '/logout';
        //     export const _ = `${Routes.Auth._}${$}`;
        //     export interface Request {}
        //     export interface Response {}
        // }}
    })(Auth = Routes.Auth || (Routes.Auth = {}));
    let Api;
    (function (Api) {
        Api.$ = '/api';
        Api._ = `${Routes._}${Api.$}`;
        let V1;
        (function (V1) {
            V1.$ = '/v1';
            V1._ = `${Routes.Api._}${V1.$}`;
            let Me;
            (function (Me) {
                let Get;
                (function (Get) {
                    Get.$ = '/me';
                    Get._ = `${Routes.Api.V1._}${Get.$}`;
                })(Get = Me.Get || (Me.Get = {}));
            })(Me = V1.Me || (V1.Me = {}));
            let Courses;
            (function (Courses) {
                let Get;
                (function (Get) {
                    Get.$ = '/courses';
                    Get._ = `${Routes.Api.V1._}${Get.$}`;
                })(Get = Courses.Get || (Courses.Get = {}));
            })(Courses = V1.Courses || (V1.Courses = {}));
            let Course;
            (function (Course) {
                let Post;
                (function (Post) {
                    Post.$ = '/courses';
                    Post._ = `${Routes.Api.V1._}${Post.$}`;
                    Post.RequestTD = {
                        name: 'string',
                        description: 'string'
                    };
                })(Post = Course.Post || (Course.Post = {}));
                let Get;
                (function (Get) {
                    Get.$ = (id) => `/courses/${id}`;
                    Get._ = (id) => `${Routes.Api.V1._}${Get.$(id)}`;
                })(Get = Course.Get || (Course.Get = {}));
                let Put;
                (function (Put) {
                    Put.$ = (id) => `/courses/${id}`;
                    Put._ = (id) => `${Routes.Api.V1._}${Put.$(id)}`;
                    Put.RequestTD = (Vts.makeTdWithOptionalProps(Course.Post.RequestTD));
                })(Put = Course.Put || (Course.Put = {}));
                let Delete;
                (function (Delete) {
                    Delete.$ = (id) => `/courses/${id}`;
                    Delete._ = (id) => `${Routes.Api.V1._}${Delete.$(id)}`;
                })(Delete = Course.Delete || (Course.Delete = {}));
            })(Course = V1.Course || (V1.Course = {}));
            let Task;
            (function (Task) {
                let Post;
                (function (Post) {
                    Post.$ = (courseId) => `/courses/${courseId}/task-new`;
                    Post._ = (courseId) => `${Routes.Api.V1._}${Post.$(courseId)}`;
                    Post.RequestTD = {
                        taskType: Vts.isOneOf(Object.values(Data.Task.Type)),
                        title: /\S/,
                        body: 'string',
                        maxMark: Vts.isZeroOrPositiveNumber,
                        attachedFileUrl: new Set(['string', 'undefined'])
                    };
                })(Post = Task.Post || (Task.Post = {}));
                let Get;
                (function (Get) {
                    Get.$ = (taskId) => `/tasks/${taskId}`;
                    Get._ = (taskId) => `${Routes.Api.V1._}${Get.$(taskId)}`;
                })(Get = Task.Get || (Task.Get = {}));
                let Put;
                (function (Put) {
                    Put.$ = (taskId) => `/tasks/${taskId}`;
                    Put._ = (taskId) => `${Routes.Api.V1._}${Put.$(taskId)}`;
                    Put.RequestTD = (Vts.makeTdWithOptionalProps(Post.RequestTD));
                })(Put = Task.Put || (Task.Put = {}));
                let Delete;
                (function (Delete) {
                    Delete.$ = (taskId) => `/tasks/${taskId}`;
                    Delete._ = (taskId) => `${Routes.Api.V1._}${Delete.$(taskId)}`;
                })(Delete = Task.Delete || (Task.Delete = {}));
            })(Task = V1.Task || (V1.Task = {}));
            let Users;
            (function (Users) {
                let Get;
                (function (Get) {
                    Get.$ = `/users`;
                    Get._ = `${Routes.Api.V1._}${Get.$}`;
                })(Get = Users.Get || (Users.Get = {}));
            })(Users = V1.Users || (V1.Users = {}));
            let User;
            (function (User) {
                let Get;
                (function (Get) {
                    Get.$ = (id) => `/users/${id}`;
                    Get._ = (id) => `${Routes.Api.V1._}${Get.$(id)}`;
                })(Get = User.Get || (User.Get = {}));
                let Put;
                (function (Put) {
                    Put.$ = `/user`;
                    Put._ = `${Routes.Api.V1._}${Put.$}`;
                    Put.RequestTD = {
                        id: Vts.optional(Vts.isBsonObjectIdString),
                        role: Vts.optional(Vts.isInEnum(UserRole)),
                        fullname: Vts.optional(Data.User.Fullname.regexp),
                        avaUrl: Vts.optional('string'),
                        isDisabled: Vts.optional('boolean'),
                        group: Vts.optional(Vts.isNullOr(Vts.isBsonObjectIdString))
                    };
                    function canPut({ issuer, targetId }) {
                        return ('id' in Put.RoleLimit[issuer.role]) || targetId === issuer.id;
                    }
                    Put.canPut = canPut;
                    Put.RoleLimit = {
                        [UserRole.Guest]: {},
                        [UserRole.Student]: Vts.take(Put.RequestTD, [
                            'fullname', 'avaUrl'
                        ]),
                        get [UserRole.Teacher]() { return this[UserRole.Student]; },
                        [UserRole.Admin]: Put.RequestTD
                    };
                })(Put = User.Put || (User.Put = {}));
                let Delete;
                (function (Delete) {
                    Delete.$ = (id) => `/users/${id}`;
                    Delete._ = (id) => `${Routes.Api.V1._}${Delete.$(id)}`;
                })(Delete = User.Delete || (User.Delete = {}));
            })(User = V1.User || (V1.User = {}));
            let Groups;
            (function (Groups) {
                let Get;
                (function (Get) {
                    Get.$ = '/groups';
                    Get._ = `${Routes.Api.V1._}${Get.$}`;
                })(Get = Groups.Get || (Groups.Get = {}));
            })(Groups = V1.Groups || (V1.Groups = {}));
            let Group;
            (function (Group) {
                let Post;
                (function (Post) {
                    Post.$ = '/groups';
                    Post._ = `${Routes.Api.V1._}${Post.$}`;
                })(Post = Group.Post || (Group.Post = {}));
                let Get;
                (function (Get) {
                    Get.$ = (id) => `/groups/${id}`;
                    Get._ = (id) => `${Routes.Api.V1._}${Get.$(id)}`;
                })(Get = Group.Get || (Group.Get = {}));
                let Put;
                (function (Put) {
                    Put.$ = (id) => `/groups/${id}`;
                    Put._ = (id) => `${Routes.Api.V1._}${Put.$(id)}`;
                })(Put = Group.Put || (Group.Put = {}));
                let Delete;
                (function (Delete) {
                    Delete.$ = (id) => `/groups/${id}`;
                    Delete._ = (id) => `${Routes.Api.V1._}${Delete.$(id)}`;
                })(Delete = Group.Delete || (Group.Delete = {}));
            })(Group = V1.Group || (V1.Group = {}));
        })(V1 = Api.V1 || (Api.V1 = {}));
    })(Api = Routes.Api || (Routes.Api = {}));
})(Routes = exports.Routes || (exports.Routes = {}));
// tslint:enable:no-shadowed-variable
exports.V1 = Routes.Api.V1;
exports.Auth = Routes.Auth;
exports.FreeAccess = new Set(Object.values(UserRole));
exports.StudentTeacherAdmin = new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]);
exports.TeacherAdmin = new Set([UserRole.Teacher, UserRole.Admin]);
exports.Admin = new Set([UserRole.Admin]);
exports.NoAccess = new Set();
exports.Authenticated = exports.StudentTeacherAdmin;
exports.RouteAccess = {
    ["POST" /* POST */]: {
        [Routes.Auth.Login.Post._]: exports.FreeAccess,
        [Routes.Auth.Register.Post._]: exports.FreeAccess,
        [Routes.Api.V1.Course.Post._]: exports.TeacherAdmin,
        [Routes.Api.V1.Task.Post._(':id')]: exports.TeacherAdmin,
        [Routes.Api.V1.Group.Post._]: exports.Admin,
    },
    ["GET" /* GET */]: {
        [Routes.Api.V1.Me.Get._]: exports.Authenticated,
        [Routes.Api.V1.Groups.Get._]: exports.StudentTeacherAdmin,
        [Routes.Api.V1.Courses.Get._]: exports.FreeAccess,
        [Routes.Api.V1.Users.Get._]: exports.StudentTeacherAdmin,
        [Routes.Api.V1.Course.Get._(':id')]: exports.FreeAccess,
        [Routes.Api.V1.Task.Get._(':id')]: exports.StudentTeacherAdmin,
        [Routes.Api.V1.Group.Get._(':id')]: exports.StudentTeacherAdmin,
        [Routes.Api.V1.User.Get._(':id')]: exports.Authenticated,
    },
    ["DELETE" /* DELETE */]: {
        [Routes.Api.V1.Course.Delete._(':id')]: exports.TeacherAdmin,
        [Routes.Api.V1.Task.Delete._(':id')]: exports.TeacherAdmin,
        [Routes.Api.V1.Group.Delete._(':id')]: exports.Admin,
        [Routes.Api.V1.User.Delete._(':id')]: exports.Admin,
    },
    ["PUT" /* PUT */]: {
        [Routes.Api.V1.Course.Put._(':id')]: exports.TeacherAdmin,
        [Routes.Api.V1.Task.Put._(':id')]: exports.TeacherAdmin,
        [Routes.Api.V1.Group.Put._(':id')]: exports.Admin,
        [Routes.Api.V1.User.Put._]: exports.Authenticated
    }
};
function mapPageArgsToNgParams(args) {
    const stringified = {
        page: args.page.toString(),
        limit: args.limit.toString()
    };
    if (args.search) {
        stringified.search = args.search;
    }
    return stringified;
}
exports.mapPageArgsToNgParams = mapPageArgsToNgParams;
