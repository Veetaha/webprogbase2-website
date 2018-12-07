import * as Mongoose        from 'mongoose';
import * as Paginate        from 'mongoose-paginate';
// import * as Vts             from 'vee-type-safe
import * as Apollo          from 'apollo-server-express';
import * as Debug           from '@modules/debug';
import * as GqlV1           from '@declarations/gql-gen-v1';
import * as ApiV1           from '@public-api/v1';
import { Task, TaskModel }  from '@models/task';
import { User  }            from '@models/user';
import { Group }            from '@models/group';
import * as Helpers         from '@modules/apollo-helpers';
import { paginate, get_id, getPopulated, set_id } from '@modules/common';

import ObjectId  = Mongoose.Types.ObjectId;
import ApiCourse = ApiV1.Data.Course;

export interface CourseData {
    description:      string;
    name:             string;
    publicationDate:  Date;
    authorId:         ObjectId;
}

const Schema = new Mongoose.Schema({
    [Helpers.paginate.metaSymbol]: {
        id: {
            aliasFor: '_id',
            required: true
        }
    } as Helpers.PaginateMetadata,
    authorId: {
        type: Mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true
    },
    description:     { type: String, required: true },
    name:            { type: String, required: true },
    publicationDate: { type: Date,   required: true, default: Date.now }
});
Schema.virtual('id').get(get_id).set(set_id);

Schema.statics = {
    updateCourse: async ({ id, patch }) => ({
        course: await Helpers.tryUpdateById(Course, id, Helpers.filterNilProps(patch))
    }),
    
    deleteCourse: async ({ id }) => ({ course: await Helpers.tryDeleteById(Course, id) }),
    getCourse:    async ({ id }) => ({ course: await Helpers.tryFindById(Course, id) }),

    getCourses: req => Helpers.paginate<Course, CourseModel>({
        ...req,
        model: Course,
        sort: { name: 'desc' }
    }),

    areValidIds: async suspect => (
        (await Course.where('_id').in(suspect).count().exec()) === suspect.length
    ),
    
    async ensureValidIds(suspect) {
        if (!await Course.areValidIds(suspect)) {
            throw new Apollo.ValidationError('bad courses id array');
        }
    },
    
    getPageRest: pageArgs => paginate<Course, CourseModel, ApiCourse.CoreJson>(Course, {
        pageArgs,
        searchField: 'name',
        select: [ '_id', 'name', 'description', 'publicationDate' ],
        sort: { publicationDate: 'desc' },
        map: (course) => ({
            id:              String(course._id),
            publicationDate: String(course.publicationDate),
            description:     course.description,
            name:            course.name
        })
    })
} as CourseModel;

Schema.methods = {
    author: getPopulated<Course>('authorId'),
    getTasks(req) {
        return Helpers.paginate<Task, TaskModel>({
            ...req,
            model: Task,
            filter: { include: { courseId: this._id }},
            sort:   { publicationDate: 'desc' }
        });
    },


    
    toCoreJsonData() {
        return {
            id:              String(this._id),
            description:     this.description,
            name:            this.name,
            publicationDate: this.publicationDate!.toISOString()
        };
    },
    async toBasicJsonData() {
        return {
            ...this.toCoreJsonData(),
            author: (await this.author()).toBasicJsonData(),
        };
    },
    async toJsonData(pageArgs) {
        type PaginatedTask = ApiCourse.Json['tasks']['data'][number];
        return {
            ...this.toCoreJsonData(),
            author: (await this.author()).toJsonData(),
            tasks: await paginate<Task, TaskModel, PaginatedTask>(Task, {
                pageArgs,
                searchField: 'title',
                searchFilter: { courseId: this._id },
                sort: { publicationDate: 'desc' },
                map: task => task.toCoreJsonData()
            })
        };
    }
} as Course;


Schema.pre('remove', async function(this: Course, next) {
    try {
        void await Promise.all([
            Task. where('courseId').     equals(this._id).remove().exec(),
            Group.where('coursesId._id').equals(this._id).remove().exec()
        ]);
        return next();
    } catch (err) {
        Debug.error(`Failed to remove references to the deleted course`);
        return next(err);
    }
});

Schema.plugin(Paginate);
export const Course = Mongoose.model<Course, CourseModel>('Course', Schema);


export interface CourseModel extends Mongoose.PaginateModel<Course, CourseData> {
    updateCourse(req: GqlV1.UpdateCourseRequest): Promise<GqlV1.UpdateCourseResponse>;
    deleteCourse(req: GqlV1.DeleteCourseRequest): Promise<GqlV1.DeleteCourseResponse>;
    getCourses  (req: GqlV1.GetCoursesRequest):   Promise<GqlV1.GetCoursesResponse>;
    getCourse   (req: GqlV1.GetCourseRequest):    Promise<GqlV1.GetCourseResponse>;
    areValidIds   (suspect: ObjectId[]): Promise<boolean>;
    ensureValidIds(suspect: ObjectId[]): Promise<void>;

    getPageRest(
        pagination: ApiV1.PaginationArgs
    ): Promise<ApiV1.Paginated<ApiCourse.CoreJson>>;
}
export interface Course extends Mongoose.Document, CourseData {
    author(): Promise<User>;
    getTasks(req: GqlV1.GetCourseTasksRequest): Promise<GqlV1.GetCourseTasksResponse>;

    toCoreJsonData():  ApiCourse.CoreJson;
    toBasicJsonData(): Promise<ApiCourse.BasicJson>;
    toJsonData(tasksPage: ApiV1.PaginationArgs): Promise<ApiCourse.Json>;
}
