import { Component, OnInit    } from '@angular/core';
import { ActivatedRoute       } from '@angular/router';
import { ErrorHandlingService } from '@services/error-handling';
import { CoursesService       } from '@services/courses';
import { PageHeaderService    } from '@services/page-header';
import { Subscriber           } from '@utils/subscriber';
import { parsePagination      } from '@utils/helpers';
import { Defaults             } from '@services/config';
import { RoutingService       } from '@services/routing';
import { SessionService       } from '@services/session';

import * as Gql from '@services/gql';

@Component({
  selector:    'app-courses',
  templateUrl: './courses.component.html',
  styleUrls:  ['./courses.component.scss']
})
export class CoursesComponent extends Subscriber implements OnInit {
    api?: Gql.GetCourses.GetCourses;

    readonly pageSizeOptions = Defaults.PaginationPageSizeOptions;
    pagination = { ...Defaults.Pagination };
    

    constructor(
        private errHandler: ErrorHandlingService,
        private backend:    CoursesService,
        private pageHeader: PageHeaderService,
        private route:      ActivatedRoute,
        public  rt:         RoutingService,
        public  session:    SessionService
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.title = 'Courses';
        this.subscrs.usr = this.session.$user.subscribe(() => {
            this.pageHeader.toolButtons = !this.rt.canAccess(this.rt.to.courseNew) ? [] : [{
                iconName:   'add',
                name:       'Add course',
                routerLink: this.rt.to.courseNew()
            }];
        });

        this.subscrs.query = this
            .route
            .queryParamMap
            .subscribe(queryParamMap => this.doSearchRequest(parsePagination(
                queryParamMap, this.pagination
            )));
    }

   doSearchRequest({
        page   = this.pagination.page,
        limit  = this.pagination.limit,
        search = this.pagination.search
    } = this.pagination) {
        this.backend.getCourses({ page, limit, search: { name: search } })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                api => {
                    this.api        = api.data.getCourses;
                    this.pagination = { page, limit, search };
                },
                err => this.errHandler.handle(err)
            );
    }
}
