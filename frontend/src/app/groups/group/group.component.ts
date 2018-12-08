import { Component, OnInit    } from '@angular/core';
import { ActivatedRoute       } from '@angular/router';
import { Subscriber           } from '@utils/subscriber';
import { PageHeaderService    } from '@services/page-header';
import { ErrorHandlingService } from '@services/error-handling';
import { trackById            } from '@utils/helpers';
import { GroupsService        } from '@services/groups';
import { RoutingService       } from '@services/routing';
import { Pagination           } from '@common/interfaces';
import { PageFetcher          } from '@vee/components/pagination';

import * as RxO from 'rxjs/operators';
import * as Gql from '@services/gql';
import Group  = Gql.GetGroup.Group;
import User   = Gql.GetGroupMembers.Data;
import Course = Gql.GetGroupCourses.Data; 

@Component({
    selector:    'app-group',
    templateUrl: './group.component.html',
    styleUrls:  ['./group.component.scss']
})
export class GroupComponent extends Subscriber implements OnInit {
    
    trackById = trackById;
    group?: Group;

    // refetchOnGroupChange = new Rx.Subject<Partial<Pagination>>();

    get coursesPageFetcher(): PageFetcher<Course> {
        return pagination => this.fetchCoursesPage(pagination);
    }
    get usersPageFetcher(): PageFetcher<User> {
        return pagination => this.fetchMembersPage(pagination);
    }
    get groupId() {
        return this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private backend:    GroupsService,
        private pageHeader: PageHeaderService,
        private errHandler: ErrorHandlingService,
        private route:      ActivatedRoute,
        public  rt:         RoutingService
    ) { super(); }


    fetchGroup(id: string) {
        this.backend.getGroup({ id }).subscribe(
            res => {
                this.group = res.data.getGroup.group;
                this.pageHeader.setHeader({
                    title:       this.group.name,
                    toolButtons: [{
                        name: 'Edit group',
                        iconName: 'edit',
                        routerLink: {
                            pathFn: this.rt.to.groupEdit,
                            args:  [this.groupId]
                        }
                    }]
                });
                // this.refetchOnGroupChange.next({ page: 1 });
            },
            err => this.errHandler.handle(err)
        );
    }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            this.fetchGroup(paramMap.get('id')!);
        });
    }

    fetchCoursesPage({ page, limit, search }: Pagination) {
        return this.backend.getGroupCourses(
            { id: this.groupId }, 
            { page, limit, search: { name: search }}
        ).pipe(RxO.map(
            res => res.data.getGroup.group.getCourses        
        ));
    }


    fetchMembersPage({ page, limit, search }: Pagination) {
        return this.backend.getGroupMembers(
            { id: this.groupId }, 
            { page, limit, search: { login: search }}
        ).pipe(RxO.map(
            res => res.data.getGroup.group.getMembers
        ));
    }

}
