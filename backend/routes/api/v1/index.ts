import * as express   from 'express';
import * as Vts       from 'vee-type-safe';
import * as VtsEx     from 'vee-type-safe/express';
import * as HttpCodes from 'http-status-codes';
import * as ApiV1     from '@public-api/v1';
import * as Debug     from '@modules/debug';
// import * as Mongoose  from 'mongoose';
// import ObjectId = Mongoose.Schema.Types.ObjectId;

import { Task                            } from '@models/task';
import { User                            } from '@models/user';
import { Course                          } from '@models/course';
import { getById, updateById, deleteById } from '@modules/vee-express-middleware';
import { getPagination                   } from '@modules/common';
import { ensureUserCanAccessRoute        } from '@modules/passport';
import { forbidden                       } from '@modules/error';

import Route        = ApiV1.Routes.Api.V1;
import GetMe        = Route.Me.Get;
import PostCourse   = Route.Course.Post;
import GetCourse    = Route.Course.Get;
import GetCourses   = Route.Courses.Get;
import PutCourse    = Route.Course.Put;
import DeleteCourse = Route.Course.Delete;
import PostTask     = Route.Task.Post;
import GetTask      = Route.Task.Get;
import PutTask      = Route.Task.Put;
import DeleteTask   = Route.Task.Delete;
import GetUsers     = Route.Users.Get;
import GetUser      = Route.User.Get;
import PutUser      = Route.User.Put;
import DeleteUser   = Route.User.Delete;

function respondWithEmptyObject(_req: express.Request, res: express.Response) {
    res.json({});
}
function ensureBodyType(typeDescr: Vts.TypeDescription) {
    return VtsEx.ensureTypeMatch(VtsEx.ReqBody, typeDescr);
}

export const router = express.Router()
.get(GetMe.$,
    ensureUserCanAccessRoute,
    (req, res) => {
        if (!req.user) {
            return Debug.shutdown();
        }
        const jsonres: GetMe.Response = req.user.toJsonData();
        return res.json(jsonres);
    }
)
.post(PostCourse.$,
    ensureUserCanAccessRoute,
    ensureBodyType(PostCourse.RequestTD),
    async ({ body, user }: VtsEx.ReqBody<PostCourse.Request>, res, next) => {
        try {
            const newCourse = await Course.create({
                authorId: user!._id,
                ...body
            });
            const jsonres: PostCourse.Response = {
                id: String(newCourse.id)
            };
            res.status(HttpCodes.CREATED).json(jsonres);
        } catch (err) {
            next(err);
        }
    }
)
.get(GetCourse.$(':id'),
    ensureUserCanAccessRoute,
    getPagination,
    getById({ model: Course }),
    async ({ pagination, db }, res, next) => {
        const course = db.gotById as Course;
        try {
            Debug.assert(pagination);
            const jsonres: GetCourse.Response = await course.toJsonData(pagination!);
            res.json(jsonres);
        } catch (err) {
            next(err);
        }
    }
)
.get(GetCourses.$,
    ensureUserCanAccessRoute,
    getPagination,
    async ({ pagination }, res, next) => {
        Debug.assert(pagination);
        try {
            const jsonres: GetCourses.Response = await Course.getPageRest(pagination!);
            res.json(jsonres);
        } catch (err) {
            next(err);
        }
    }
)
.put(PutCourse.$(':id'),
    ensureUserCanAccessRoute,
    ensureBodyType(PutCourse.RequestTD),
    updateById(Course),
    respondWithEmptyObject
)
.delete(DeleteCourse.$(':id'),
    ensureUserCanAccessRoute,
    deleteById(Course),
    respondWithEmptyObject
)
.post(PostTask.$(':id'),
    ensureUserCanAccessRoute,
    ensureBodyType(PostTask.RequestTD),
    getById({ model:  Course }),
    async ({ db, body, user }: VtsEx.ReqBody<PostTask.Request>, res, next) => {
    try {
        const newTask = await new Task({
            courseId: db.gotById._id,
            authorId: user!._id,
            ...body
        }).save();
        const jsonResponse: PostTask.Response = {
            id: String(newTask._id)
        };
        res.status(HttpCodes.CREATED).json(jsonResponse);
    } catch (err) {
        next(err);
    }
})
.get(GetTask.$(':id'),
    ensureUserCanAccessRoute,
    getById({ model: Task }),
    async (req, res) =>  res.json(await (req.db.gotById as Task).toJsonData())
)
.put(PutTask.$(':id'),
    ensureUserCanAccessRoute,
    ensureBodyType(PutTask.RequestTD),
    updateById(Task),
    respondWithEmptyObject
)
.delete(DeleteTask.$(':id'),
    ensureUserCanAccessRoute,
    getById({ model: Task }),
    deleteById(Task),
    respondWithEmptyObject
)
.get(GetUsers.$,
    ensureUserCanAccessRoute,
    getPagination,
    async ({ pagination }, res, next) => {
        Debug.assert(pagination);
        try {
            const jsonres: GetUsers.Response = await User.getPageRest(pagination!);
            res.json(jsonres);
        } catch (err) {
            next(err);
        }
    }
)
.get(GetUser.$(':id'),
    ensureUserCanAccessRoute,
    getById({ model: User }),
    (req, res) => {
        const jsonres: GetUser.Response = (req.db.gotById as User).toJsonData();
        res.json(jsonres);
    }
)
.put(PutUser.$,
    ensureUserCanAccessRoute,
    VtsEx.ensureTypeMatch(VtsEx.ReqBody, PutUser.RequestTD),
    async ({ body, user }: VtsEx.ReqBody<PutUser.Request>, res, next) => {
        if (!user!.canPutUser(body)) {
            return next(forbidden());
        }
        try {
            if (!body.id) {
                void await user!.update(body as any).exec();
            } else {
                const id = body.id;
                delete body.id;
                void await User.findByIdAndUpdate(id, body);
            }
            return res.json({});
        } catch (err) {
            next(err);
        }
    }
)
.delete(DeleteUser.$(':id'),
    ensureUserCanAccessRoute,
    deleteById(User),
    respondWithEmptyObject
)
.use(((err, _req, res, _next) => {
    const jsonError: ApiV1.ErrorResponse = {
        error: err.message
    };
    res.status(err.status || HttpCodes.INTERNAL_SERVER_ERROR).json(jsonError);
}) as express.ErrorRequestHandler);

