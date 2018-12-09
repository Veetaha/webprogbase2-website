import { Component, OnInit } from '@angular/core';
import { ActivatedRoute    } from '@angular/router';

import { RoutingService    } from '@services/routing';
import { PageHeaderService } from '@services/page-header';
import { CoursesService    } from '@services/courses';
import { Subscriber        } from '@utils/subscriber';

import * as Gql from '@services/gql';

import Task = Gql.GetTaskWithResult.Task;

@Component({
    selector:    'app-task',
    templateUrl: './task.component.html',
    styleUrls:  ['./task.component.scss']
})
export class TaskComponent extends Subscriber implements OnInit {
    task?: Task;
    canSolveTask?: boolean;

    constructor(
        private pageHeader: PageHeaderService,
        private backend:    CoursesService,
        private route:      ActivatedRoute,
        public  rt:         RoutingService
    ) { super(); }

    get taskId() {
        return this.route.snapshot.paramMap.get('id')!
    }

    get resultCheck() {
        return this.task && this.task.myTaskResult && this.task.myTaskResult.check;
    }

    ngOnInit() {
        this.subscrs.paramMap = this.route.paramMap.subscribe(params => {
            this.backend
                .getTaskWithResult({ id: params.get('id')! })
                .pipe(this.pageHeader.displayLoading())
                .subscribe(res => {
                    this.task         = res.data.getTask.task;
                    this.canSolveTask = res.data.canSolveTask.answer;
                    this.pageHeader.setHeader({
                        title: this.task.title,
                        toolButtons: [{
                            iconName: 'edit',
                            name: 'Edit task',
                            routerLink: {
                                pathFn: this.rt.to.taskEdit,
                                args: [this.taskId]
                            }
                        }]
                    });
                });
        });
    }
}
