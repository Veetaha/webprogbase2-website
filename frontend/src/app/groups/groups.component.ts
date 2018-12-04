import { Component, OnInit    } from '@angular/core';
import { ActivatedRoute       } from '@angular/router';
import { ErrorHandlingService } from '@services/error-handling';
import { GroupsService        } from '@services/groups';
import { PageHeaderService    } from '@services/page-header';
import { Subscriber           } from '@utils/subscriber';
import { parsePagination      } from '@utils/helpers';
import { Defaults             } from '@services/config';
import { RoutingService       } from '@services/routing';

import * as Gql from '@services/gql';

@Component({
  selector:    'app-groups',
  templateUrl: './groups.component.html',
  styleUrls:  ['./groups.component.scss']
})
export class GroupsComponent extends Subscriber implements OnInit {
    api?: Gql.GetGroups.GetGroups;

    readonly pageSizeOptions = Defaults.PaginationPageSizeOptions;
    pagination = { ...Defaults.Pagination };
    

    constructor(
        private errHandler: ErrorHandlingService,
        private backend:    GroupsService,
        private pageHeader: PageHeaderService,
        private route:      ActivatedRoute,
        public  rt:         RoutingService
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.setHeader({
            title: 'Groups',
            toolButtons: [{
                iconName:   'add',
                name:       'Add group',
                routerLink: { pathFn: this.rt.to.groupNew }
            }]
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
        this.backend.getGroups({ page, limit, search: { name: search } })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                ({data: { getGroups }}) => {
                    this.api        = getGroups;
                    this.pagination = { page, limit, search };
                },
                err => this.errHandler.handle(err)
            );
    }
}
