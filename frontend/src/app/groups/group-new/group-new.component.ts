import { Component, OnInit      } from '@angular/core';
import { Router                 } from '@angular/router';
import { MatSelectionListChange } from '@angular/material/list';
import { Subscriber             } from '@utils/subscriber';
import { byId                   } from '@utils/helpers';
import { PageHeaderService      } from '@services/page-header';
import { RoutingService         } from '@services/routing';
import { ErrorHandlingService   } from '@services/error-handling';
import { Defaults               } from '@services/config';
import { GroupsService          } from '@services/groups';
import { CoursesService         } from '@services/courses';
import { UsersService           } from '@services/users';
import { Maybe, Paginated, Identifiable, Pagination } from '@common/interfaces';

import * as Gql   from '@services/gql';
import * as Rx    from 'rxjs';
import * as RxO   from 'rxjs/operators';

import User   = Gql.GetUsers.Data;
import Course = Gql.GetCourses.Data;



abstract class SlectionManager<TData extends Identifiable> {
    chosen: TData[] = [];
    free:   Maybe<Paginated<TData>>;
    pagination = { ...Defaults.Pagination };

    constructor(private errHandler: ErrorHandlingService) {}
    init() {
        this.doSearchRequest({ page: 1 });
    }

    protected abstract fetchPage(
        pagination: Pagination
    ): Rx.Observable<Paginated<TData>>;

    doSearchRequest({
        page   = this.pagination.page,
        limit  = this.pagination.limit,
        search = this.pagination.search
    }: Partial<Pagination> = this.pagination) {
        this.fetchPage({page, limit, search}).subscribe(
            data => this.free = data,
            err  => this.errHandler.handle(err)
        );
    }
    

    onFreeSelectionListChange(
        { option: { value, selected }}: MatSelectionListChange
    ) {
        const changedItem = value as TData;
        if (selected) {
            this.chosen.push(changedItem);
        } else {
            this.removeChosen(changedItem);
        }
    }

    onChosenSelectionListChange({ option: { value }}: MatSelectionListChange) {
        this.removeChosen(value);

    }

    private removeChosen({ id }: TData) {
        this.chosen.splice(this.chosen.findIndex(byId(id)), 1);
    }

    isSelected({ id }: TData) {
        return !!this.chosen.find(byId(id));
    }

}

class StudentsSelectionManager extends SlectionManager<User> {
    constructor(
        errHandler: ErrorHandlingService,
        private backend: UsersService
    ) { 
        super(errHandler);
    }

    protected fetchPage(
        { page, limit, search }: Pagination
    ): Rx.Observable<Paginated<User>> {
        return this.backend.getUsers({
            page, limit, 
            search: {
                login: search
            },
            filter: {
                include: {
                    groupId: null,
                    role: [Gql.UserRole.Student]
                }
            }
        }).pipe(
            RxO.map(({data: { getUsers }}) => getUsers)
        );
    }
}

class CoursesSelectionManager extends SlectionManager<Course> {
    constructor(
        errHandler: ErrorHandlingService,
        private backend: CoursesService
    ) { super(errHandler); }

    protected fetchPage(
        { page, limit, search }: Pagination
    ): Rx.Observable<Paginated<Course>> {
        return this.backend
            .getCourses({ page, limit, search: { name: search }})
            .pipe(RxO.map(({data: { getCourses }}) => getCourses));
    }
}

@Component({
    selector:    'app-group-new',
    templateUrl: './group-new.component.html',
    styleUrls:  ['./group-new.component.scss']
})
export class GroupNewComponent extends Subscriber implements OnInit {
    newGroup = {
        name: ''
    };

    stLists: StudentsSelectionManager;
    crLists: CoursesSelectionManager;

    readonly pageSizeOptions = Defaults.PaginationPageSizeOptions;
    coursesPg  = { ...Defaults.Pagination, search: { name: ''  }};
    
    trackById(_index: number, suspect: Identifiable) {
        return suspect.id;
    }   

    constructor(
        private pageHeader:     PageHeaderService,
        private groupsService:  GroupsService,
        private router:         Router,
        private errHandler:     ErrorHandlingService,
        public  rt:             RoutingService,
        coursesService:         CoursesService,
        usersService:           UsersService
    ) {
        super();
        this.stLists = new StudentsSelectionManager(errHandler, usersService);
        this.crLists = new CoursesSelectionManager(errHandler, coursesService);
    }

    ngOnInit() {
        this.stLists.init();
        this.crLists.init();
        this.pageHeader.setHeader({ title: 'New group' });
    }

    onFormSubmit() {
        this.groupsService
            .createGroup({
                name:    this.newGroup.name,
                members: this.stLists.chosen.map(member => member.id),
                courses: []
            })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                ({ data }) => this.router.navigateByUrl(this.rt.to.group(
                    data!.createGroup.group.id
                )),
                err => this.errHandler.handle(err)
            );
    }

    

}
