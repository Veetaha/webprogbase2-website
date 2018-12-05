import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from '@services/page-header';
import { RoutingService    } from '@services/routing';
import { UsersService      } from '@services/users';
import { Subscriber        } from '@utils/subscriber';
import { ActivatedRoute    } from '@angular/router';
import { Defaults          } from '@services/config';
import { parsePagination   } from '@utils/helpers';

import * as Gql from '@services/gql';
import { ErrorHandlingService } from '@services/error-handling';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent extends Subscriber implements OnInit {
    api?: Gql.GetUsers.GetUsers;
    pagination = { ...Defaults.Pagination };
  
    constructor(
        private pageHeader: PageHeaderService,
        private route:      ActivatedRoute,
        private backend:    UsersService,
        public  rt:         RoutingService,
        public  errHandler: ErrorHandlingService
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Users' });

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
        this.backend.getUsers({ page, limit, search: { login: search }})
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                api => {
                    this.api = api.data.getUsers;
                    this.pagination = { page, limit, search };
                },
                err => this.errHandler.handle(err)
        );
    }

}
