import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router       } from '@angular/router';
import { ErrorHandlingService         } from '@services/error-handling';
import { PageHeaderService            } from '@services/page-header';
import { GroupsService                } from '@services/groups';
import { UsersService                 } from '@services/users';
import { CoursesService               } from '@services/courses';
import { RoutingService               } from '@services/routing';
import { Pagination                   } from '@common/interfaces';
import { Subscriber 	              } from '@utils/subscriber';
import { PageFetcher	              } from '@vee/components/pagination';
import { ListSelectorComponent        } from '@vee/components/list-selector';
import { trackById 		              } from '@utils/helpers';

import * as Gql from '@services/gql';
import * as RxO from 'rxjs/operators';
import * as Rx  from 'rxjs';
import * as _   from 'lodash';

import User   = Gql.GetGroupMembers.Data;
import Course = Gql.GetGroupCourses.Data;

@Component({
    selector:    'app-group-edit',
    templateUrl: './group-edit.component.html',
    styleUrls:  ['./group-edit.component.scss']
})
export class GroupEditComponent extends Subscriber implements OnInit {

    @ViewChild('usersSelectorEl')   usersEl!:   ListSelectorComponent<User>;
    @ViewChild('coursesSelectorEl') coursesEl!: ListSelectorComponent<Course>;



    trackById = trackById;
    originalGroup?: Gql.GetFullGroup.Group & {
        members: User[],
        courses: Course[]
    }

    newGroup = {
    	name: ''
    }
    refetchOnGroupChange = new Rx.Subject<Partial<Pagination>>();

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
    	private groupsService:  GroupsService,
        private coursesService: CoursesService,
        private usersService:   UsersService,
        private router:         Router,
    	private route:          ActivatedRoute,
    	private errHandler:     ErrorHandlingService,
    	private pageHeader:     PageHeaderService,
    	public  rt:             RoutingService
    ) { super(); }

    ngOnInit() {
    	this.pageHeader.setHeader({ title: 'Edit group' })
    	this.subscrs.group = this.route.paramMap.pipe(RxO.flatMap(
    		paramMap => this.groupsService.getFullGroup(
                { id: paramMap.get('id')! },
                { limit: 100, page: 1 },
                { limit: 100, page: 1 }
    	))).subscribe(
    		res => this.originalGroup = { 
                get members() { return this.getMembers.data; },
                get courses() { return this.getCourses.data; },
                ...res.data.getGroup.group
    		},
    		err => this.errHandler.handle(err)
    	);
    }

    fetchCoursesPage({ page, limit, search }: Pagination) {
    	return this.coursesService.getCourses({
			page, limit, search: { name: search }
        }).pipe(RxO.map(
			res => res.data.getCourses		
		));
    }


	fetchMembersPage({ page, limit, search }: Pagination) {
		return this.usersService.getUsers({ 
            page, 
            limit, 
            search: { login: search },
            filter: {
                include: {
                    role: [Gql.UserRole.Student]
                }
            }
		}).pipe(RxO.map(
            res => res.data.getUsers
		));
	}

    onFormSubmit() {
        this.groupsService.updateGroup({ 
            id: this.groupId,
            patch: {
                name: this.newGroup.name,
                // @TODO: addCourses, removeCourse, addMembers, removeMembers
            }
        }).subscribe(
            () => this.router.navigateByUrl(
                this.rt.to.group(this.groupId)
            ),
            err => this.errHandler.handle(err)
        )
    }

}
