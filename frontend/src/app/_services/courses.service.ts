import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as Vts from 'vee-type-safe';
import * as Api from '@public-api/v1';
import * as Gql from '@services/gql';
import { ErrorHandlingService } from '@services/error-handling';


@Injectable({
  providedIn: 'root'
}) export class CoursesService {
    constructor(
        private updateTaskResultCheckGql: Gql.UpdateTaskResultCheckGQL,
        private createTaskResultCheckGql: Gql.CreateTaskResultCheckGQL,
        private getLocalTaskResultsGql:   Gql.GetLocalTaskResultsGQL,
        private getTaskResultsGql:        Gql.GetTaskResultsGQL,
        private getTaskWithResultGql:     Gql.GetTaskWithResultGQL,
        private createTaskResultGql:      Gql.CreateTaskResultGQL,
        private updateTaskResultGql:      Gql.UpdateTaskResultGQL,
        private getTaskForEditGql:        Gql.GetTaskForEditGQL,
        private updateTaskGql:            Gql.UpdateTaskGQL,
        private getCoursesGql:            Gql.GetCoursesGQL,
        private http:                     HttpClient,
        private errHandling:              ErrorHandlingService
    ) { }
    private options = { fetchPolicy: 'no-cache' } as { fetchPolicy: 'no-cache' };


    private errHandler<T>() {
        return this.errHandling.handler<T>();
    }


    updateTaskResultCheck(req: Gql.UpdateTaskResultCheckRequest) {
        return this.updateTaskResultCheckGql.mutate({ req }, this.options);
    }

    createTaskResultCheck(req: Gql.CreateTaskResultCheckRequest) {
        return this.createTaskResultCheckGql.mutate({ req }, this.options);
    }


    getLocalTaskResults(
        taskReq: Gql.GetTaskRequest, 
        localResultsReq: Gql.GetLocalTaskResultsRequest
    ) {
        return this.getLocalTaskResultsGql.fetch({ taskReq, localResultsReq }, this.options);
    }

    getTaskResults(req: Gql.GetTaskResultsRequest) {
        return this.getTaskResultsGql.fetch({ req }, this.options);
    }

    createTaskResult(req: Gql.CreateTaskResultRequest) {
        return this.createTaskResultGql.mutate({ req }, this.options);
    }
    
    updateTaskResult(req: Gql.UpdateTaskResultRequest) {
        return this.updateTaskResultGql.mutate({ req }, this.options);
    }

    postCourse(coursePostRequest: Api.V1.Course.Post.Request) {
        return this.http.post<Api.V1.Course.Post.Response>(
            Api.V1.Course.Post._,
            Vts.takeFromKeys(coursePostRequest, Api.V1.Course.Post.RequestTD)
        )
        .pipe(this.errHandler());
    }

    getCourses(req: Gql.GetCoursesRequest) {
        return this.getCoursesGql.fetch({ req }, this.options);
    }

    getCourse(courseId: string, pageArgs: Api.PaginationArgs) {
        return this.http.get<Api.V1.Course.Get.Response>(
            Api.V1.Course.Get._(courseId), {
            params: Api.mapPageArgsToNgParams(pageArgs)
        })
        .pipe(this.errHandler());
    }

    putCourse(courseId: string, coursePutRequest: Api.V1.Course.Put.Request) {
        return this.http.put<Api.V1.Course.Put.Response>(
            Api.V1.Course.Put._(courseId),
            Vts.takeFromKeys(coursePutRequest, Api.V1.Course.Put.RequestTD)
        )
        .pipe(this.errHandler());
    }

    deleteCourse(courseId: string) {
        return this.http.delete<void>(
            Api.V1.Course.Delete._(courseId)
        )
        .pipe(this.errHandler());
    }

    postTask(courseId: string, taskPostRequest: Api.V1.Task.Post.Request) {
        return this.http.post<Api.V1.Task.Post.Response>(
            Api.V1.Task.Post._(courseId),
            Vts.takeFromKeys(taskPostRequest, Api.V1.Task.Post.RequestTD)
        )
        .pipe(this.errHandler());
    }

    getTaskWithResult(req: Gql.GetTaskRequest) {
        return this.getTaskWithResultGql.fetch({ taskReq: req, canSolveTaskReq: req }, this.options);
    }
    
    getTaskForEdit(req: Gql.GetTaskRequest) {
        return this.getTaskForEditGql.fetch({req}, this.options);
    }

    updateTask(req: Gql.UpdateTaskRequest) {
        return this.updateTaskGql.mutate({ req }, this.options);
    }

    deleteTask(taskId: string) {
        return this.http.delete<void>(
            Api.V1.Task.Put._(taskId),
        )
        .pipe(this.errHandler());
    }
}
