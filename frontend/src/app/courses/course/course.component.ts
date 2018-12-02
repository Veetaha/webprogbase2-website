import { Component, OnInit } from '@angular/core';
import { ActivatedRoute    } from '@angular/router';
import { Subscriber        } from '@utils/subscriber';
import { parsePagination   } from '@utils/helpers';
import { PageHeaderService } from '@services/page-header';
import { CoursesService    } from '@services/courses';
import { Defaults          } from '@services/config';
import { RoutingService    } from '@services/routing';
import { SessionService    } from '@services/session';

import * as Api             from '@public-api/v1';

@Component({
    selector: 'app-course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.scss']
})
export class CourseComponent extends Subscriber implements OnInit {
    course!: Api.V1.Course.Get.Response;

    pageSizeOptions = Defaults.PaginationPageSizeOptions;
    pagination: Api.PaginationArgs = { ...Defaults.Pagination };

    private get courseId() {
        return this.course ? this.course.id : this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private route:      ActivatedRoute,
        private backend:    CoursesService,
        private pageHeader: PageHeaderService,
        public  rt:         RoutingService,
        private session:    SessionService
    ) {
        super();
    }

    ngOnInit() {
        this.subscrs.query = this
            .route
            .queryParamMap
            .subscribe(queryParamMap => this.doSearchRequest(parsePagination(
                queryParamMap, this.pagination
            )));

        this.subscrs.usr = this.session.$user.subscribe(() => {
            if (!this.rt.canAccess(this.rt.to.courseEdit)) {
                this.pageHeader.toolButtons = [];
            }
        });
    }

    doSearchRequest({
        page   = this.pagination.page,
        limit  = this.pagination.limit,
        search = this.pagination.search
    } = this.pagination) {
        this.pageHeader.loading = true;
        const newPagination = { page, limit, search };
        this.backend
            .getCourse(this.courseId, newPagination)
            .subscribe(
                course => {
                    this.course     = course;
                    this.pagination = newPagination;
                    this.pageHeader.setHeader({
                        loading:     false,
                        title:       this.course.name,
                        toolButtons: !this.rt.canAccess(this.rt.to.courseEdit) ? [] : [{
                            name: 'Edit course',
                            iconName: 'edit',
                            routerLink: this.rt.to.courseEdit(course.id)
                        }]
                    });
                }
            );
    }


}
