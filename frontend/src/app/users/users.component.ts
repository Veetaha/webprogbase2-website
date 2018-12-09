import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from '@services/page-header';
import { RoutingService    } from '@services/routing';
import { UsersService      } from '@services/users';
import { Pagination        } from '@common/interfaces';
import { PageFetcher       } from '@vee/components/pagination';

import * as RxO from 'rxjs/operators';
import * as Gql from '@services/gql';

import User = Gql.GetUsers.Data;

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    get usersPageFetcher(): PageFetcher<User> {
        return pagination => this.fetchUsersPage(pagination);
    }
  
    constructor(
        private pageHeader: PageHeaderService,
        private backend:    UsersService,
        public  rt:         RoutingService
    ) {}

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Users' });

        // this.subscrs.query = this
        //     .route
        //     .queryParamMap
        //     .subscribe(queryParamMap => this.doSearchRequest(parsePagination(
        //         queryParamMap, this.pagination
        //     )));
    }

    fetchUsersPage({ page, limit, search }: Pagination) {
        return this.backend.getUsers({ 
                page, limit, search: { login: search }
            }).pipe(RxO.map(
                res => res.data.getUsers
            ));
    }

}
