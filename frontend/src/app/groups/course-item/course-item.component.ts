import { Component, Input } from '@angular/core';
import * as Gql   from '@services/gql';

import Course   = Gql.GetCourses.Data;


@Component({
    selector:    'app-course-item',
    templateUrl: './course-item.component.html',
    styleUrls:  ['./course-item.component.scss']
})
export class CourseItemComponent {
    @Input()
    course?: Course;
}
