import { Component, OnInit    } from '@angular/core';
import { Router               } from '@angular/router';
import { Subscriber           } from '@utils/subscriber';
import { PageHeaderService    } from '@services/page-header';
import { RoutingService       } from '@services/routing';
import { ErrorHandlingService } from '@services/error-handling';
import { Defaults             } from '@services/config';
import { GroupsService        } from '@services/groups';
import { CoursesService       } from '@services/courses';
import { UsersService         } from '@services/users';

import * as CdkDD from '@angular/cdk/drag-drop';
import * as Gql   from '@services/gql';

import User   = Gql.GetUsers.Data;
import Course = Gql.GetCourses.Data;

@Component({
    selector:    'app-group-new',
    templateUrl: './group-new.component.html',
    styleUrls:  ['./group-new.component.scss']
})
export class GroupNewComponent extends Subscriber implements OnInit {
    newGroup = {
        name: '',
        courses: [] as Course[],
        members: [] as User[]
    };

    freeStudents?: Gql.GetUsers.GetUsers;
    freeCourses?:  Gql.GetCourses.GetCourses;

    readonly pageSizeOptions = Defaults.PaginationPageSizeOptions;
    coursesPagination = { ...Defaults.Pagination };
    usersPagination = { ...Defaults.Pagination };
   

    constructor(
        private pageHeader:     PageHeaderService,
        private groupsService:  GroupsService,
        private coursesService: CoursesService,
        private usersService:   UsersService,
        private router:         Router,
        private errHandler:     ErrorHandlingService,
        public  rt:             RoutingService
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'New group' });
    }

    onFormSubmit() {
        this.groupsService
            .createGroup({
                name:    this.newGroup.name,
                members: this.newGroup.members.map(member => member.id),
                courses: this.newGroup.courses.map(course => course.id)
            })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                ({ data: { group }}) => this.router.navigateByUrl(this.rt.to.group(group.id)),
                err => this.errHandler.handle(err)
            );
    }

    doCoursesSearchRequest({
        page   = this.coursesPagination.page,
        limit  = this.coursesPagination.limit,
        search = this.coursesPagination.search
    } = this.coursesPagination) {
        this.coursesService.getCourses({ page, limit, search: { name: search } })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                ({ data: { getCourses }}) => {
                    this.freeCourses       = getCourses;
                    this.coursesPagination = { page, limit, search };
                },
                err => this.errHandler.handle(err)
            );
    }

    onStudentDrop({
        previousContainer,
        container,
        previousIndex,
        currentIndex
    }: CdkDD.CdkDragDrop<User[]>) {
        if (previousContainer === container) {
            CdkDD.moveItemInArray(
                container.data,
                previousIndex,
                currentIndex
            );
        } else {
            CdkDD.transferArrayItem(
                previousContainer.data,
                container.data,
                previousIndex,
                currentIndex
            );
        }
    }
}
