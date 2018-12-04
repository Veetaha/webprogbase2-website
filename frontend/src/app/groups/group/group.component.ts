import { Component, OnInit } from '@angular/core';
import { ActivatedRoute    } from '@angular/router';
import { Subscriber        } from '@utils/subscriber';
import { parsePagination   } from '@utils/helpers';
import { PageHeaderService } from '@services/page-header';
import { GroupsService    } from '@services/groups';
import { Defaults          } from '@services/config';
import { RoutingService    } from '@services/routing';

import * as Gql             from '@services/gql';

@Component({
    selector:    'app-group',
    templateUrl: './group.component.html',
    styleUrls:  ['./group.component.scss']
})
export class GroupComponent extends Subscriber implements OnInit {
    group!: Gql.GetGroup.Group;

    pageSizeOptions = Defaults.PaginationPageSizeOptions;
    pagination = { ...Defaults.Pagination };

    private get groupId() {
        return this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private route:      ActivatedRoute,
        private backend:    GroupsService,
        private pageHeader: PageHeaderService,
        public  rt:         RoutingService
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
    }

    doSearchRequest({
        page   = this.pagination.page,
        limit  = this.pagination.limit,
        search = this.pagination.search
    } = this.pagination) {
        this.pageHeader.loading = true;
        const newPagination = { page, limit, search };
        this.backend
            .getGroup({ id: this.groupId }, { limit, page, search: { login: search }})
            .subscribe(
                ({ data: { getGroup: { group }}}) => {
                    this.group      = group;
                    this.pagination = newPagination;
                    this.pageHeader.setHeader({
                        loading:     false,
                        title:       this.group.name,
                        toolButtons: [{
                            name: 'Edit group',
                            iconName: 'edit',
                            routerLink: {
                                pathFn: this.rt.to.groupEdit,
                                args: [this.groupId]
                            }
                        }]
                    });
                }
            );
    }


}
