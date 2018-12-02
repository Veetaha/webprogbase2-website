import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog              } from '@angular/material/dialog';
import { EditorOption           } from 'angular-markdown-editor';
import { ConfigService          } from '@services/config';
import { CoursesService         } from '@services/courses';
import { PageHeaderService      } from '@services/page-header';
import { RoutingService         } from '@services/routing';
import { Subscriber             } from '@utils/subscriber';
import { 
    ConfirmDialogComponent,
    ConfirmDialogOptions,
    ConfirmDialogResult
} from '@vee/components/confirm-dialog';

import * as Api from '@public-api/v1';

@Component({
  selector:    'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls:  ['./task-edit.component.scss']
})
export class TaskEditComponent extends Subscriber implements OnInit {
    readonly taskTypes = Object.values(Api.TaskType);

    task?: Api.V1.Task.Get.Response;
    title = '';
    attachedFileUrl?: string;
    body = '';
    taskType: Api.TaskType = Api.TaskType.Homework;
    maxMark = 0;
    editorOptions!: EditorOption;


    get taskId() {
        return this.task ? this.task.id : this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private dialog:         MatDialog,
        private pageHeader:     PageHeaderService,
        private serverApi:      CoursesService,
        private router:         Router,
        private route:          ActivatedRoute,
        private configService:  ConfigService,
        public  rt:             RoutingService
    ) { super(); }

    onDeleteTaskDemand() {
        this.dialog.open<ConfirmDialogComponent, ConfirmDialogOptions, ConfirmDialogResult>(
            ConfirmDialogComponent, {
                data: {
                    titleHtml: 'Sanity check',
                    contentHtml: 'Are you sure you want to delete this task?'
                }
            }
        ).afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.serverApi.deleteTask(this.taskId).subscribe(() =>
                    this.router.navigateByUrl(
                        this.rt.to.course(this.task!.courseId)
                    )
                );
            }
        });
    }


    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Edit task' });
        this.editorOptions    = this.configService.makeMarkdownEditorOptions();
        this.subscrs.paramMap = this.route.paramMap.subscribe(paramMap => {
            this.serverApi.getTask(paramMap.get('id')!).subscribe(
                task => {
                    this.task            = task;
                    this.title           = task.title;
                    this.taskType        = task.taskType;
                    this.maxMark         = task.maxMark;
                    this.body            = task.body;
                    this.attachedFileUrl = task.attachedFileUrl;
                }
            );
        });
    }

    onFormSubmit() {
        if (!this.task) {
            console.error(`task hasn't been loaded yet`);
            return;
        }
        const task = this.task;
        this.serverApi
            .putTask(task.id, this)
            .subscribe(() => this.router.navigateByUrl(
                this.rt.to.task(task.id)
            ));
    }
}
