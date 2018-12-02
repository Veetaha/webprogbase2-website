import { Component, OnInit }         from '@angular/core';
import { EditorOption }              from 'angular-markdown-editor';
import { ActivatedRoute, Router }    from '@angular/router';
import * as Api                      from '@public-api/v1';

import { PageHeaderService } from '@services/page-header';
import { RoutingService    } from '@services/routing';

import { ConfigService }             from '@services/config';
import { CoursesService }            from '@services/courses';

@Component({
    selector: 'app-task-new',
    templateUrl: './task-new.component.html',
    styleUrls: ['./task-new.component.scss']
})
export class TaskNewComponent implements OnInit {
    readonly taskTypes = Object.values(Api.TaskType);

    title = '';
    maxMark = 0;
    body = '';
    taskType: Api.TaskType = Api.TaskType.Homework;
    attachedFileUrl?: string;
    editorOptions!: EditorOption;

    constructor(
        private pageHeader:    PageHeaderService,
        private serverApi:     CoursesService,
        private configService: ConfigService,
        private route:         ActivatedRoute,
        private router:        Router,
        public  rt:       RoutingService
    ) { }

    ngOnInit() {
        this.editorOptions = this.configService.makeMarkdownEditorOptions();
        this.pageHeader.setHeader({ title: 'New task' });
    }
    onFormSubmit() {
        const courseId = this.route.snapshot.paramMap.get('id')!;
        this.serverApi.postTask(courseId, this).subscribe(
            res => this.router.navigateByUrl(
                this.rt.to.task(res.id)
            )
        );
        
    }

}
