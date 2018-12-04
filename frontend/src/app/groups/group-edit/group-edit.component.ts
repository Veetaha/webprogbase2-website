import { Component, OnInit } from '@angular/core';
import { Subscriber        } from '@utils/subscriber';

@Component({
    selector: 'app-group-edit',
    templateUrl: './group-edit.component.html',
    styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent extends Subscriber implements OnInit {
    ngOnInit() {}
}
