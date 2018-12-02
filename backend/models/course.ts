import * as Mongoose        from 'mongoose';
import * as Paginate        from 'mongoose-paginate';
// import * as Vts             from 'vee-type-safe';
import * as Debug           from '@modules/debug';
import * as GqlV1           from '@declarations/gql-gen-v1';
import * as ApiV1           from '@public-api/v1';
import { Task, TaskModel }  from '@models/task';
import { User }             from '@models/user';
import * as Helpers         from '@modules/apollo-helpers';
import { paginate, get_id, getPopulated } from '@modules/common';

import ObjectId  = Mongoose.Types.ObjectId;
import ApiCourse = ApiV1.Data.Course;

export interface CourseData {
    description:      string;
    name:             string;
    publicationDate:  Date;
    authorId:         ObjectId;
}



const Schema = new Mongoose.Schema({
    authorId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description:     { type: String, required: true },
    name:            { type: String, required: true },
    publicationDate: { type: Date,   default: Date.now }
});
Schema.virtual('id').get(get_id);

Schema.statics = {
    getCourse: ({ id }) => Helpers.tryFindById(Course, id),

    getCourses: ({ page, limit, search }) => Helpers.paginate<Course, CourseModel>(Course, {
        page, limit, search, sort: { name: 'desc' }
    }),


    
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
    getTasks({ page, limit, search }) {
        return Helpers.paginate<Task, TaskModel>(Task, {
            page, limit, search,
            searchFilter: { courseId: this._id },
            sort: { publicationDate: 'desc' }
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
        void await Task.deleteMany({
            courseId: this._id
        }).exec();
        return next();
    } catch (err) {
        Debug.error(`Failed to remove tasks from deleted course`);
        return next(err);
    }
});

Schema.plugin(Paginate);
export const Course = Mongoose.model<Course, CourseModel>('Course', Schema);


export interface CourseModel extends Mongoose.PaginateModel<Course, CourseData> {
    getCourses(req: GqlV1.GetCoursesRequest): Promise<GqlV1.GetCoursesResponse>;
    getCourse(req: GqlV1.GetCourseRequest): Promise<Course>;
    getPageRest(
        pagination: ApiV1.PaginationArgs
    ): Promise<ApiV1.Paginated<ApiCourse.CoreJson>>;
}
export interface Course extends Mongoose.Document, CourseData {
    author(): Promise<User>;
    getTasks(req: GqlV1.GetTasksRequest): Promise<GqlV1.GetTasksResponse>;

    toCoreJsonData():  ApiCourse.CoreJson;
    toBasicJsonData(): Promise<ApiCourse.BasicJson>;
    toJsonData(tasksPage: ApiV1.PaginationArgs): Promise<ApiCourse.Json>;
}