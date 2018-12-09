import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorOption           } from 'angular-markdown-editor';
import { Defaults               } from '@services/config';
import { ConfigService          } from '@services/config';
import { CoursesService         } from '@services/courses';
import { Subscriber             } from '@utils/subscriber';
import { RoutingService         } from '@services/routing';
import { PageHeaderService      } from '@services/page-header';
import { parsePagination        } from '@utils/helpers';

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
        private pageHeader:     PageHeaderService,
        private backend:      CoursesService,
        private router:         Router,
        private route:          ActivatedRoute,
        private configService:  ConfigService,
        public  rt:             RoutingService
    ) { super(); }

    onTaskDeleteDemand(task: Api.Data.Task.BasicJson) {
        this.pageHeader.openConfirmDialog({
            titleHtml:   `Sanity check`,
            contentHtml: `Are you sure you want to delete this task?`
        }).subscribe(confirmed => {
            if (confirmed) {
                const deletedTaskTitle = task.title;
                this.backend
                    .deleteTask(task.id)
                    .pipe(this.pageHeader.displayLoading())
                    .subscribe(() => {
                        this.pageHeader.flashSnackBar(
                            `Task '${deletedTaskTitle}' was successfully deleted.`
                        );
                        this.doSearchRequest();
                    });
            }
        });

        
    }

    onDeleteCourseDemand() {
        this.pageHeader.openConfirmDialog({
            titleHtml:   `Sanity check`,
            contentHtml: `Are you sure you want to delete this course?`
        }).subscribe(confirmed => {   
            if (confirmed) {
                const deletedCourseName = this.course!.name;
                this.backend
                    .deleteCourse(this.courseId)
                    .pipe(this.pageHeader.displayLoading())
                    .subscribe(
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
            .subscribe(queryParamMap => this.doSearchRequest(
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
        this.backend
            .putCourse(this.courseId, this.userInput)
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
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
        this.backend
            .getCourse(courseId, newPagination)
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                resCourse => {
                    if (!this.course || courseId !== resCourse.id) {
                        this.userInput = resCourse;
                    }
                    this.course     = resCourse;
                    this.pagination = newPagination;
                }
        );
    }
}
