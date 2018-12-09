import { Component, OnInit, Input } from '@angular/core';
import { PageHeaderService        } from '@services/page-header';
import { RoutingService           } from '@services/routing';
import { CoursesService           } from '@services/courses';
import { ErrorHandlingService     } from '@services/error-handling';
import { Pagination               } from '@common/interfaces';
import { PageFetcher              } from '@vee/components/pagination';
import { trackById                } from '@utils/helpers';
import { TrcEditService           } from '@services/trc-edit';

import * as RxO from 'rxjs/operators';
import * as Gql from '@services/gql';
import * as Rx  from 'rxjs';

import TaskResult = Gql.GetLocalTaskResults.Data;

@Component({
    selector:    'app-task-results',
    templateUrl: './task-results.component.html',
    styleUrls:  ['./task-results.component.scss']
})
export class TaskResultsComponent implements OnInit {
    @Input() taskId!: string;

    updatePage = new Rx.Subject<void>();

    trackById = trackById;


    get taskResultsPageFetcher(): PageFetcher<TaskResult> {
        return pagination => this.fetchTaskResultsPage(pagination);
    }

    constructor(
        private trcEdit:    TrcEditService,
        private pageHeader: PageHeaderService,
        private backend:    CoursesService,
        private errHandler: ErrorHandlingService,
        public  rt:         RoutingService
    ) {}

    checkTaskResult(taskResult: TaskResult) {
        this.trcEdit.openTrcEditDialog({
            taskResult
        }).subscribe(
            result => {
                if (!result) {
                    return;
                }
                (result as Rx.Observable<unknown>).subscribe(
                    () => {
                        this.pageHeader.flashSnackBar(
                            `Successfuly updated task result score for "${taskResult.author.login}"`
                        );
                        this.updatePage.next();
                    },
                    err => this.errHandler.handle(err)
                )
            },
            err => this.errHandler.handle(err)
        )
    }
  
    ngOnInit() {
    }

    fetchTaskResultsPage({ page, limit }: Pagination) {
        return this.backend.getLocalTaskResults(
            { id: this.taskId },
            { page, limit }
        ).pipe(RxO.map(
            res => res.data.getTask.task.getLocalTaskResults
        ));
    }

}
