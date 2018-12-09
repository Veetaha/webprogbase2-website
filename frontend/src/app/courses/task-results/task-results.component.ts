import { Component, OnInit, Input } from '@angular/core';
import { PageHeaderService        } from '@services/page-header';
import { RoutingService           } from '@services/routing';
import { CoursesService           } from '@services/courses';
import { Pagination               } from '@common/interfaces';
import { PageFetcher              } from '@vee/components/pagination';
import { trackById                } from '@utils/helpers';

import * as RxO from 'rxjs/operators';
import * as Gql from '@services/gql';

import TaskResult = Gql.GetLocalTaskResults.Data;

@Component({
    selector:    'app-task-results',
    templateUrl: './task-results.component.html',
    styleUrls:  ['./task-results.component.scss']
})
export class TaskResultsComponent implements OnInit {
    @Input() taskId!: string;

    trackById = trackById;


    get taskResultsPageFetcher(): PageFetcher<TaskResult> {
        return pagination => this.fetchTaskResultsPage(pagination);
    }

    checkTaskResult(taskResult: TaskResult) {
        this.pageHeader.openConfirmDialog({
            titleHtml: `Check result of "${taskResult.author}"`,
            contentHtml: 'Fill score here...'
        }).subscribe();
    }
  
    constructor(
        private pageHeader: PageHeaderService,
        private backend:    CoursesService,
        public  rt:         RoutingService
    ) {}

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
