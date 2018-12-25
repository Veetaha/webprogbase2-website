import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RoutingService    } from '@services/routing';
import { Subscriber        } from '@utils/subscriber';
import { Maybe             } from '@common/interfaces';
import { CoursesService    } from '@services/courses';
import { PageHeaderService } from '@services/page-header';

import * as Vts from 'vee-type-safe';
import * as Gql from '@services/gql';
import * as _   from 'lodash';

import TaskResult = Gql.GetTaskWithResult.MyTaskResult;
import TaskResultPatch = Gql.UpdateTaskResultPatch;
import TaskResultCreatePayload = Gql.CreateTaskResultRequest;

@Component({
    selector:    'app-task-result',
    templateUrl: './task-result.component.html',
    styleUrls:  ['./task-result.component.scss']
})
export class TaskResultComponent extends Subscriber implements OnInit {
    @Input('taskResult')        srcResult?: Maybe<TaskResult>;
    @Output('taskResultChange') srsResultChange = new EventEmitter<TaskResult>();
    @Input() taskId!: string;

    updResult?: Maybe<TaskResultPatch | TaskResultCreatePayload>;

    constructor(
        public  rt: RoutingService,
        private pageHeader: PageHeaderService,
        private backend: CoursesService
    ) { super(); }

    private switchToEdit() {
        this.updResult = this.srcResult
            ? _.cloneDeep(Vts.take(this.srcResult, ['body', 'fileUrl']))
            : {
                body: 'Result body here',
                fileUrl: null
            };
    }

    editTaskResult() {
        if (this.srcResult) {
            this.pageHeader.openConfirmDialog({
                titleHtml: 'Sanity check',
                contentHtml: 'Are you sure you want to edit this task results?'
            }).subscribe(confirm => {
                if (confirm) {
                    this.switchToEdit();
                }
            });
        } else {
            this.switchToEdit();
        }
    }

    ngOnInit() {}
    
    onFormSubmit() {
        if (!this.updResult) {
            console.error('update data is not ready yet');
            return;
        }
        if (this.srcResult) {
            this.backend.updateTaskResult({ id: this.srcResult.id, patch: this.updResult })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(res => {
                    this.srcResult = res.data!.updateTaskResult.taskResult;
                    this.updResult = null;
                    this.pageHeader.flashSnackBar('Task result was successfully updated');
                    this.srsResultChange.emit(this.srcResult!);
                });
        } else {
            this.backend.createTaskResult({ ...this.updResult, taskId: this.taskId })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(res => {
                    this.srcResult = res.data!.createTaskResult.taskResult;
                    this.updResult = null;
                    this.pageHeader.flashSnackBar('Task result was successfully created');
                    this.srsResultChange.emit(this.srcResult!);
                });
        }
    }
}
