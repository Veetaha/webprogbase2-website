import { MatSelectionListChange } from '@angular/material/list';
import { Maybe, Paginated, Identifiable, Pagination } from '@common/interfaces';
import { byId                   } from '@utils/helpers';
import { Defaults               } from '@services/config';
import { ErrorHandlingService   } from '@services/error-handling';
import { UsersService           } from '@services/users';
import { CoursesService         } from '@services/courses';

import * as Gql   from '@services/gql';
import * as Rx    from 'rxjs';
import * as RxO   from 'rxjs/operators';


import User   = Gql.GetUsers.Data;
import Course = Gql.GetCourses.Data;

export abstract class SlectionManager<TData extends Identifiable> {
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

export class StudentsSelectionManager extends SlectionManager<User> {
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

export class CoursesSelectionManager extends SlectionManager<Course> {
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