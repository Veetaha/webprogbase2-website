import { Component, OnInit        } from '@angular/core';
import { ActivatedRoute, Router   } from '@angular/router';
import { ErrorHandlingService     } from '@services/error-handling';
import { PageHeaderService        } from '@services/page-header';
import { GroupsService            } from '@services/groups';
import { UsersService             } from '@services/users';
import { CoursesService           } from '@services/courses';
import { RoutingService           } from '@services/routing';
import { Pagination, Identifiable } from '@common/interfaces';
import { Subscriber 	          } from '@utils/subscriber';
import { PageFetcher	          } from '@vee/components/pagination';
import { trackById, getId         } from '@utils/helpers';

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
    trackById = trackById;
    srcGroup?: Gql.GetFullGroup.Group;

    newGroup = {
    	name: '',
        getCourses: {
            data: [] as Course[]
        },
        getMembers: {
            data: [] as User[]
        }
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
    		res => {
                this.srcGroup = res.data.getGroup.group;
                this.newGroup = _.cloneDeep(this.srcGroup);
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
                    role: [Gql.UserRole.Student],
                    groupId: [null, this.groupId]
                }
            }
		}).pipe(RxO.map(
            res => res.data.getUsers
		));
	}

    onDeleteGroup() {
        this.pageHeader.openConfirmDialog({
            titleHtml: 'Sanity check',
            contentHtml: 'Are you sure you want to delete this group?'
        }).subscribe(confirmed => { 
            const deletedGroupName = this.srcGroup!.name;
            if (!confirmed) {
                return;
            }
            this.groupsService.deleteGroup({ id: this.groupId })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(
                    () => {
                        this.pageHeader.flashSnackBar(
                            `Successfully deleted group "${deletedGroupName}"`
                        );
                        this.router.navigateByUrl(this.rt.to.groups());
                    },
                    err => this.errHandler.handle(err)
                );
        });
    }

    onFormSubmit() {
        function diff(rel: Identifiable[], target: Identifiable[]) {
            return _(rel).differenceBy(target, getId).map(getId).value();
        }

        this.groupsService.updateGroup({ 
            id: this.groupId,
            patch: {
                name: this.newGroup.name,    
                addMembers: diff(
                    this.newGroup.getMembers.data,
                    this.srcGroup!.getMembers.data
                ),
                removeMembers: diff(
                    this.srcGroup!.getMembers.data,
                    this.newGroup.getMembers.data
                ),
                addCourses: diff(
                    this.newGroup.getCourses.data,
                    this.srcGroup!.getCourses.data
                ),
                removeCourses: diff(
                    this.srcGroup!.getCourses.data,
                    this.newGroup.getCourses.data
                )
            }
        })
        .pipe(this.pageHeader.displayLoading())
        .subscribe(
            () => { 
                this.pageHeader.flashSnackBar(
                    `Group "${this.srcGroup!.name}" was successfully updated.`
                );
                this.router.navigateByUrl(this.rt.to.group(this.groupId));
            },
            err => this.errHandler.handle(err)
        )
    }

}
