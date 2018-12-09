import { Component, Input } from '@angular/core';
import * as Gql from '@services/gql';

import TaskResult = Gql.GetTaskWithResult.MyTaskResult;
@Component({
    selector:    'app-task-result-view',
    templateUrl: './task-result-view.component.html',
    styleUrls:  ['./task-result-view.component.scss']
})
export class TaskResultViewComponent {
    @Input() taskResult!: TaskResult;
    @Input() set showLastUpdate(value: unknown) {
        this._showLastUpdate = value === '' || !!value;
    } 
    get showLastUpdate() {
        return this._showLastUpdate;
    }
    _showLastUpdate = false;
}
