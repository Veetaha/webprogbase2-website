import * as Vts from 'vee-type-safe';
import * as HttpCodes from 'http-status-codes';
import * as GqlGen from './gql';
export interface Paginated<T = unknown> {
    total: number;
    data:  T[];
}

export const enum HttpMethod {
    POST   = 'POST',
    GET    = 'GET',
    PUT    = 'PUT',
    DELETE = 'DELETE'
}

export namespace Data {

    export interface Id {
        id: string;
    }

    export namespace User  {
        
        export import Role = GqlGen.UserRole;
        export class Credential {
            constructor(
                public regexp: RegExp,
                public formatHint: string,
                public name: string,
                public minLength: number,
                public maxLength: number
            ) {}
            isValid(credential: string) {
                return this.regexp.test(credential);
            }
            invalidErrorMessage() {
                return `invalid ${this.name}`;
            }
        }
        
        export const Password = new Credential(
            /^\S{6,32}$/,
            'only nonspace characters',
            'password',
            6, 32
        );

        export const Login = new Credential(
            /^[A-Za-z\d_-]{4,32}$/,
            '[A-Za-z0-9_-]',
            'login',
            4, 32
        );

        export const Fullname = new Credential(
            /^\S{3,32}$/,
            'only nonspace characters',
            'fullname',
            3, 32
        );
        export interface BasicJson extends Id {
            login:        string;
            fullname:     string;
            role:         Role;
            avaUrl:       string;
            isDisabled:   boolean;
        }

        export interface Json extends BasicJson {
            registeredAt: string;        // ISO-8601 date
            group:        string | null; // objectId
        }
        export const JsonTD: Vts.TypeDescriptionOf<Json> = {
            id:           Vts.isBsonObjectIdString,
            login:        Login.regexp,
            registeredAt: Vts.isIsoDateString,
            group:        Vts.isNullOr(Vts.isBsonObjectIdString),
            fullname:     Fullname.regexp,
            role:         Vts.isInEnum(Role),
            avaUrl:       'string',
            isDisabled:   'boolean'
        };
    }
    export namespace Task {
        
        export import Type = GqlGen.TaskType;
        export interface CoreJson extends Id {
            taskType: Type;
            title:    string;
            maxMark:  number;
        }
        export interface BasicJson extends CoreJson {
            author: User.BasicJson;
        }
        export interface Json extends CoreJson {
            author:           User.Json;
            courseId:         string;
            body:             string;
            attachedFileUrl?: string;
        }
    }
    
    export namespace Course {
        export interface CoreJson extends Id {
            name:            string;
            description:     string;
            publicationDate: string; // ISO-8601
        }
        export interface BasicJson extends CoreJson {
            author: User.BasicJson;
        }
        export interface Json extends CoreJson {
            author: User.Json;
            tasks: Paginated<Task.CoreJson>;
        }
    }
    
    export namespace Group {
        export interface BasicJson extends Id {
            name:        string;
            openCourses: string[];
        }
        export interface Json extends BasicJson {
            students:    Paginated<User.BasicJson>;
        }
    }

    export interface BasicJwtPayload {
        iat: number;
        exp:  string;
    }
    
    export interface CustomJwtPayload {
        sub: string;
    }
    export interface JwtPayload extends BasicJwtPayload, CustomJwtPayload {}
    
    export const JwtPayloadTD: Vts.TypeDescriptionOf<JwtPayload> = {
        sub: Vts.isBsonObjectIdString,
        iat: Vts.isZeroOrPositiveInteger,
        exp: Vts.isZeroOrPositiveInteger
    };
}

import UserRole = Data.User.Role;

export import UserRole = Data.User.Role;
export import TaskType = Data.Task.Type;

export interface PaginationArgs {
    page:    number;
    limit:   number;
    search?: string;
}

export interface ErrorResponse {
    error: string;
}

export interface PaginationQParamsGetRequest {
    page:    string;
    limit:   string;
    search?: string;
}

function isStringifiedPositiveInteger(suspect: unknown) {
    return Vts.isPositiveInteger(Number(suspect));
}

export const PaginationQParamsGetRequestTD:
Vts.TypeDescriptionOf<PaginationQParamsGetRequest> = {
    page:  isStringifiedPositiveInteger,
    limit: isStringifiedPositiveInteger,
    search: Vts.optional('string')
};



// export interface TasksGetResponse   extends PaginatedResponse<TaskGetResponse>      {}

// tslint:disable:no-shadowed-variable
export namespace Routes {
    export const $ = '';
    export const _ = '';

    export namespace Auth {
        export const $ = '/auth';
        export const _ = `${Routes._}${$}`;

        // POST ONLY
        export namespace Login { export namespace Post {
            export const $ = '/login';
            export const _ = `${Routes.Auth._}${$}`;

            export interface Request {
                login:    string;
                password: string;
            }
            export const RequestTD: Vts.TypeDescriptionOf<Request> = {
                login:    Data.User.Login.regexp,
                password: Data.User.Password.regexp
            };
            export namespace Response {
                export interface Success {
                    jwt:     string;
                }

                export const FailureStatus = HttpCodes.EXPECTATION_FAILED;
                export interface Failure {
                    failure: string;
                }
                export const FailureTD: Vts.TypeDescriptionOf<Failure> = {
                    failure: 'string'
                };
            }
        }}

        
        export namespace Register { export namespace Post {
            export const $ = '/register';
            export const _ = `${Routes.Auth._}${$}`;

            export interface Request {
                login:    string;
                password: string;
                fullname: string;
                avaUrl?:  string;
            }
            export const RequestTD: Vts.TypeDescriptionOf<Request> = {
                login:    Data.User.Login.regexp,
                password: Data.User.Password.regexp,
                fullname: Data.User.Fullname.regexp,
                avaUrl:   Vts.optional('string')
            };
            
            export namespace Response {
                export interface Success {
                    jwt: string;
                }
                export const SuccessTD: Vts.TypeDescriptionOf<Success> = {
                    jwt: 'string'
                };
                export interface Failure {
                    failure: string;
                }
                export const FailureTD: Vts.TypeDescriptionOf<Failure> = {
                    failure: 'string'
                };
                export const FailureStatus = HttpCodes.EXPECTATION_FAILED;
            }
        }}

        // export namespace Logout { export namespace Post {
        //     export const $ = '/logout';
        //     export const _ = `${Routes.Auth._}${$}`;

        //     export interface Request {}
        //     export interface Response {}
        // }}
    }
    export namespace Api {
        export const $ = '/api';
        export const _ = `${Routes._}${$}`;

        export namespace Get {
            export interface Request {}
            export interface Response {}
        }

        export namespace V1 {
            export const $ = '/v1';
            export const _ = `${Routes.Api._}${$}`;

            export namespace Get {
                // export interface Request {}
                // export interface Response {}
            }

            export namespace Me { export namespace Get {
                export const $ = '/me';
                export const _ = `${Routes.Api.V1._}${$}`;

                export interface Response extends Data.User.Json {}
            }}

            export namespace Courses { export namespace Get {
                export const $ = '/courses';
                export const _ = `${Routes.Api.V1._}${$}`;

                export interface Request {}
                export interface Response extends
                Paginated<Data.Course.CoreJson> {}
            }}
            export namespace Course {
                export namespace Post {
                    export const $ = '/courses';
                    export const _ = `${Routes.Api.V1._}${$}`;
    
                    export interface Request {
                        name:        string;
                        description: string;
                    }
                    export const RequestTD: Vts.TypeDescriptionOf<Request> = {
                        name:        'string',
                        description: 'string'
                    };
                    export interface Response {
                        id: string;
                        // publicationDate: string; // ISO-8601 date
                    }
                }

                export namespace Get {
                    export const $ = (id: string) => `/courses/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;
    
                    export interface Response extends Data.Course.Json {}
                }
    
                export namespace Put {
                    export const $ = (id: string) => `/courses/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;
       
                    export type  Request   = Partial<Course.Post.Request>;
                    export const RequestTD: Vts.TypeDescriptionOf<Request> = (
                        Vts.makeTdWithOptionalProps(Course.Post.RequestTD)
                    );
                    export interface Response {}
                }
                export namespace Delete {
                    export const $ = (id: string) => `/courses/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;
                }
            }
        
            export namespace Task {
                export namespace Post {
                    export const $ = (courseId: string) => `/courses/${courseId}/task-new`;
                    export const _ = (courseId: string) => `${Routes.Api.V1._}${$(courseId)}`;

                                    
                    export interface Request {
                        taskType:         Data.Task.Type;
                        title:            string;
                        body:             string;
                        maxMark:          number;
                        attachedFileUrl?: string;
                    }
                    export const RequestTD: Vts.TypeDescriptionOf<Request> = {
                        taskType:        Vts.isOneOf(Object.values(Data.Task.Type)),
                        title:           /\S/,
                        body:            'string',
                        maxMark:         Vts.isZeroOrPositiveNumber,
                        attachedFileUrl: new Set<Vts.TypeDescription>(['string', 'undefined'])
                    };
                    export interface Response {
                        id: string;
                    }
                }
                export namespace Get {
                    export const $ = (taskId: string) => `/tasks/${taskId}`;
                    export const _ = (taskId: string) => `${Routes.Api.V1._}${$(taskId)}`;

                    export interface Response extends Data.Task.Json {}
                }
                export namespace Put {
                    export const $ = (taskId: string) => `/tasks/${taskId}`;
                    export const _ = (taskId: string) => `${Routes.Api.V1._}${$(taskId)}`;

                    export type  Request   = Partial<Post.Request>;
                    export const RequestTD: Vts.TypeDescriptionOf<Request> = (
                        Vts.makeTdWithOptionalProps(Post.RequestTD)
                    );
                    export interface Response {}
                }
                export namespace Delete {
                    export const $ = (taskId: string) => `/tasks/${taskId}`;
                    export const _ = (taskId: string) => `${Routes.Api.V1._}${$(taskId)}`;
                }
            }
            export namespace Users { export namespace Get {
                export const $ = `/users`;
                export const _ = `${Routes.Api.V1._}${$}`;
                export interface Response extends Paginated<Data.User.BasicJson> {}
            }}

            export namespace User {
                export namespace Get {
                    export const $ = (id: string) => `/users/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;

                    export type Response = Data.User.Json;
                }
                export namespace Put {
                    export const $ = `/user`;
                    export const _ = `${Routes.Api.V1._}${$}`;

                    export interface Request {
                        id?:         string;
                        role?:       UserRole;
                        fullname?:   string;
                        avaUrl?:     string;
                        isDisabled?: boolean;
                        group?:      string | null; // id
                    }
                    export const RequestTD: Vts.TypeDescriptionOf<Request> = {
                        id:         Vts.optional(Vts.isBsonObjectIdString),
                        role:       Vts.optional(Vts.isInEnum(UserRole)),
                        fullname:   Vts.optional(Data.User.Fullname.regexp),
                        avaUrl:     Vts.optional('string'),
                        isDisabled: Vts.optional('boolean'),
                        group:      Vts.optional(Vts.isNullOr(Vts.isBsonObjectIdString))
                    };
                    interface CanPutArgs {
                        issuer: {
                            role: UserRole;
                            id: string;
                        };
                        targetId: string;
                    }
                    export function canPut({issuer, targetId}: CanPutArgs) {
                        return ('id' in RoleLimit[issuer.role]) || targetId === issuer.id;
                    }

                    export const RoleLimit = {
                        [UserRole.Guest]: {},
                        [UserRole.Student]: Vts.take(RequestTD, [
                            'fullname', 'avaUrl'
                        ]),
                        get [UserRole.Teacher]() { return this[UserRole.Student]; },
                        [UserRole.Admin]: RequestTD
                    } as Vts.BasicObjectMap<UserRole, Vts.TypeDescriptionOf<Request>>;

                    export interface Response {}

                }
                export namespace Delete {
                    export const $ = (id: string) => `/users/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;
                }
            }
            export namespace Groups { export namespace Get {
                export const $ = '/groups';
                export const _ = `${Routes.Api.V1._}${$}`;

                export interface Response {}
            }}

            export namespace Group {
                export namespace Post {
                    export const $ = '/groups';
                    export const _ = `${Routes.Api.V1._}${$}`;

                    export interface Request {}
                    export interface Response {}
                }
                export namespace Get {
                    export const $ = (id: string) => `/groups/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;

                    export interface Response {}
                }
                export namespace Put {
                    export const $ = (id: string) => `/groups/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;


                    export interface Request {}
                    export interface Response {}
                }
                export namespace Delete {
                    export const $ = (id: string) => `/groups/${id}`;
                    export const _ = (id: string) => `${Routes.Api.V1._}${$(id)}`;
                }
            }
        }

    }
}
// tslint:enable:no-shadowed-variable

export import V1 = Routes.Api.V1;
export import Auth = Routes.Auth;


export const FreeAccess          = new Set<UserRole>(Object.values(UserRole));
export const StudentTeacherAdmin = new Set([UserRole.Student, UserRole.Teacher, UserRole.Admin]);
export const TeacherAdmin        = new Set([UserRole.Teacher, UserRole.Admin]);
export const Admin               = new Set([UserRole.Admin]);
export const NoAccess            = new Set<UserRole>();
export const Authenticated       = StudentTeacherAdmin;

export const RouteAccess = {
    [HttpMethod.POST]: {
        [Routes.Auth.Login.Post._]:             FreeAccess,
        [Routes.Auth.Register.Post._]:          FreeAccess,
        [Routes.Api.V1.Course.Post._]:          TeacherAdmin,
        [Routes.Api.V1.Task.Post._(':id')]:     TeacherAdmin,
        [Routes.Api.V1.Group.Post._]:           Admin,
    },
    [HttpMethod.GET]: {
        [Routes.Api.V1.Me.Get._]:               Authenticated,
        [Routes.Api.V1.Groups.Get._]:           StudentTeacherAdmin,
        [Routes.Api.V1.Courses.Get._]:          FreeAccess,
        [Routes.Api.V1.Users.Get._]:            StudentTeacherAdmin,
        [Routes.Api.V1.Course.Get._(':id')]:    FreeAccess,
        [Routes.Api.V1.Task.Get._(':id')]:      StudentTeacherAdmin,
        [Routes.Api.V1.Group.Get._(':id')]:     StudentTeacherAdmin,
        [Routes.Api.V1.User.Get._(':id')]:      Authenticated,
    },
    [HttpMethod.DELETE]: {
        [Routes.Api.V1.Course.Delete._(':id')]: TeacherAdmin,
        [Routes.Api.V1.Task.Delete._(':id')]:   TeacherAdmin,
        [Routes.Api.V1.Group.Delete._(':id')]:  Admin,
        [Routes.Api.V1.User.Delete._(':id')]:   Admin,
    },
    [HttpMethod.PUT]: {
        [Routes.Api.V1.Course.Put._(':id')]:    TeacherAdmin,
        [Routes.Api.V1.Task.Put._(':id')]:      TeacherAdmin,
        [Routes.Api.V1.Group.Put._(':id')]:     Admin,
        [Routes.Api.V1.User.Put._]:             Authenticated
    }
};

export function mapPageArgsToNgParams(args: PaginationArgs): Vts.BasicObject<string> {
    const stringified: Vts.BasicObject<string> = {
        page:  args.page.toString(),
        limit: args.limit.toString()
    };
    if (args.search) {
        stringified.search = args.search;
    }
    return stringified;
}

