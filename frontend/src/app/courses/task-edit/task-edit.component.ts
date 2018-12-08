import { Component, OnInit      } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorOption           } from 'angular-markdown-editor';
import { ConfigService          } from '@services/config';
import { CoursesService         } from '@services/courses';
import { PageHeaderService      } from '@services/page-header';
import { RoutingService         } from '@services/routing';
import { Subscriber             } from '@utils/subscriber';

import * as Gql from '@services/gql';
import * as _   from 'lodash';

import Task = Gql.GetTaskForEdit.Task;

@Component({
  selector:    'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls:  ['./task-edit.component.scss']
})
export class TaskEditComponent extends Subscriber implements OnInit {
    readonly taskTypes = Object.values(Gql.TaskType);

    srcTask?: Task;
    updTask: Gql.UpdateTaskRequestPatch = {
        title: '',
        body: '',
        taskType: Gql.TaskType.Homework,
        maxMark: 0
    };
    editorOptions!: EditorOption;


    get taskId() {
        return this.route.snapshot.paramMap.get('id')!;
    }

    constructor(
        private pageHeader:     PageHeaderService,
        private backend:      CoursesService,
        private router:         Router,
        private route:          ActivatedRoute,
        private configService:  ConfigService,
        public  rt:             RoutingService
    ) { super(); }

    onDeleteTaskDemand() {
        if (!this.srcTask) {
            console.error('task has not been loaded yet');
            return;
        }
        const { title, courseId } = this.srcTask;
        this.pageHeader.openConfirmDialog({
                titleHtml: 'Sanity check',
                contentHtml: 'Are you sure you want to delete this task?'

        }).subscribe(confirmed => {
            if (confirmed) {
                this.backend.deleteTask(this.taskId).subscribe(() => {
                    this.pageHeader.flashSnackBar(`Task "${title} was successfully deleted`);
                    this.router.navigateByUrl(this.rt.to.course(courseId));
                });
            }
        });
    }


    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Edit task' });
        this.editorOptions    = this.configService.makeMarkdownEditorOptions();
        this.subscrs.paramMap = this.route.paramMap.subscribe(paramMap => {
            this.backend.getTaskForEdit({ id: paramMap.get('id')! }).subscribe(
                task => {
                    this.srcTask = task.data.getTask.task;
                    this.updTask = _.cloneDeep(this.srcTask);
                }
            );
        });
    }

    onFormSubmit() {
        if (!this.srcTask) {
            console.error(`task hasn't been loaded yet`);
            return;
        }
        const updatedTaskId = this.taskId;
        const prevTaskTitle = this.srcTask.title;
        this.backend
            .updateTask({
                id: updatedTaskId,
                patch: this.updTask
            })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(() => {
                this.pageHeader.flashSnackBar(`Successfully updated task "${prevTaskTitle}"`);
                this.router.navigateByUrl(this.rt.to.task(updatedTaskId));
            });
    }
}
