import { Component, OnInit } from '@angular/core';
import { ActivatedRoute    } from '@angular/router';

import * as Api from '@public-api/v1';

import { RoutingService    } from '@services/routing';
import { PageHeaderService } from '@services/page-header';
import { CoursesService    } from '@services/courses';
import { Subscriber        } from '@utils/subscriber';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.scss']
})
export class TaskComponent extends Subscriber implements OnInit {
    task?: Api.V1.Task.Get.Response;

    constructor(
        private pageHeader: PageHeaderService,
        private backend:    CoursesService,
        private route:      ActivatedRoute,
        public  rt:         RoutingService
    ) { super(); }

    ngOnInit() {
        this.subscrs.paramMap = this.route.paramMap.subscribe(params => {
            this.backend
                .getTask(params.get('id')!)
                .pipe(this.pageHeader.displayLoading())
                .subscribe(task => {
                    this.task = task;
                    this.pageHeader.setHeader({
                        title: task.title,
                        toolButtons: [{
                            iconName: 'edit',
                            name: 'Edit task',
                            routerLink: {
                                pathFn: this.rt.to.taskEdit,
                                args: [task.id]
                            }
                        }]
                    });
            });
        });
    }
}
