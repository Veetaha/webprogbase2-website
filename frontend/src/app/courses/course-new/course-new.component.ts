import { Component, OnInit } from '@angular/core';
import { Router            } from '@angular/router';
import { EditorOption      } from 'angular-markdown-editor';
import { ConfigService     } from '@services/config';
import { CoursesService    } from '@services/courses';
import { PageHeaderService } from '@services/page-header';
import { RoutingService    } from '@services/routing';

import * as Api from '@public-api/v1';

@Component({
    selector: 'app-course-new',
    templateUrl: './course-new.component.html',
    styleUrls: ['./course-new.component.scss']
})
export class CourseNewComponent implements OnInit {
    newCourse: Api.V1.Course.Post.Request = {
        name:        '',
        description: ''
    };
    
    editorOptions!: EditorOption;

    constructor(
        private pageHeader:     PageHeaderService,
        private coursesService: CoursesService,
        private router:         Router,
        private configService:  ConfigService,
        public  rt:        RoutingService
    ) { }

    ngOnInit() {
        this.editorOptions = this.configService.makeMarkdownEditorOptions();
        this.pageHeader.setHeader({ title: 'New course' });
    }

    onFormSubmit() {
        this.coursesService.postCourse(this.newCourse).subscribe(
            course => this.router.navigateByUrl(
                this.rt.to.course(course.id)
            )
        );
    }

}
