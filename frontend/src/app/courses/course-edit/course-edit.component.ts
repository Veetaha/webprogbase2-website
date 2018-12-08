import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog              } from '@angular/material/dialog';
import { EditorOption           } from 'angular-markdown-editor';
import { Defaults               } from '@services/config';
import { ConfigService          } from '@services/config';
import { CoursesService         } from '@services/courses';
import { Subscriber             } from '@utils/subscriber';
import { RoutingService         } from '@services/routing';
import { PageHeaderService      } from '@services/page-header';
import { parsePagination        } from '@utils/helpers';
import {
    ConfirmDialogComponent,
    ConfirmDialogOptions,
    ConfirmDialogResult
} from '@vee/components/confirm-dialog';

import * as RxO from 'rxjs/operators';
import * as Api from '@public-api/v1';

@Component({
    selector:    'app-course-edit',
    templateUrl: './course-edit.component.html',
    styleUrls:  ['./course-edit.component.scss']
})
export class CourseEditComponent extends Subscriber implements OnInit {
    addTaskButtonLink = '';
    course?: Api.V1.Course.Get.Response;
    userInput: Api.V1.Course.Put.Request = {
        name: '',
        description: ''
    };
    editorOptions!: EditorOption;

    pageSizeOptions = Defaults.PaginationPageSizeOptions;
    pagination = { ...Defaults.Pagination };

    get courseId() {
        return this.course
            ? this.course.id
            : this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private dialog:         MatDialog,
        private pageHeader:     PageHeaderService,
        private serverApi:      CoursesService,
        private router:         Router,
        private route:          ActivatedRoute,
        private configService:  ConfigService,
        public  rt:             RoutingService
    ) { super(); }

    onTaskDeleteDemand(task: Api.Data.Task.BasicJson) {
        this.dialog.open<ConfirmDialogComponent, ConfirmDialogOptions, ConfirmDialogResult>(
            ConfirmDialogComponent, {
            data: {
                titleHtml:   `Sanity check`,
                contentHtml: `Are you sure you want to delete this task?`
            }
        }).afterClosed().subscribe(confirmed => {
            if (confirmed) {
                const deletedTaskTitle = task.title;
                this.pageHeader.loading = true;
                this.serverApi.deleteTask(task.id)
                .subscribe(() => {
                    this.pageHeader.loading = false;
                    this.pageHeader.flashSnackBar(
                        `Task '${deletedTaskTitle}' was successfully deleted.`
                    );
                    this.doSearchRequest();
                });
            }
        });

        
    }

    onDeleteCourseDemand() {
        this.dialog.open<ConfirmDialogComponent, ConfirmDialogOptions, ConfirmDialogResult>(
            ConfirmDialogComponent, {
            data: {
                titleHtml:   `Sanity check`,
                contentHtml: `Are you sure you want to delete this course?`
            }
        }).afterClosed().subscribe(confirmed => {
            if (confirmed) {
                const deletedCourseName = this.course!.name;
                this.serverApi.deleteCourse(this.courseId).subscribe(
                    () =>  {
                        this.pageHeader.flashSnackBar(
                            `Course '${deletedCourseName}' was successfully deleted.`
                        );
                        this.router.navigateByUrl(this.rt.to.courses());
                    }
                );
            }
        });

    }


    ngOnInit() {
        this.pageHeader.setHeader({
            title: 'Edit course'
        });
        this.editorOptions = this.configService.makeMarkdownEditorOptions();

        
        this.subscrs.query = this
            .route
            .queryParamMap
            .subscribe(queryParamMap =>  this.doSearchRequest(
                parsePagination(queryParamMap, this.pagination)
            ));
        
        this.subscrs.paramMap = this
            .route
            .paramMap
            .pipe(RxO.skip(1))
            .subscribe(paramMap => this.doSearchRequest(
                this.pagination, paramMap.get('id')!
            ));
    }

    onFormSubmit() {
        const updatedCourseName = this.course!.name;
        this.serverApi.putCourse(this.courseId, this.userInput).subscribe(
            () => {
                this.pageHeader.flashSnackBar(
                    `Course '${updatedCourseName}' was successfully updated.`
                );
                this.router.navigateByUrl(this.rt.to.course(this.courseId));
            }
        );
    }

    doSearchRequest({
            page   = this.pagination.page,
            search = this.pagination.search,
            limit  = this.pagination.limit
        } = this.pagination,
        courseId = this.courseId
    ) {
        const newPagination = { page, limit, search };
        this.pageHeader.loading = true;
        this.serverApi.getCourse(courseId, newPagination).subscribe(
            resCourse => {
                this.pageHeader.loading = false;
                if (!this.course || courseId !== resCourse.id) {
                    this.userInput = resCourse;
                }
                this.course     = resCourse;
                this.pagination = newPagination;
            }
        );
    }
}
