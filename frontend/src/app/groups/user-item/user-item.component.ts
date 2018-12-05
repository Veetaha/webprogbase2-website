import { Component, Input } from '@angular/core';
import * as Gql   from '@services/gql';

import User   = Gql.GetUsers.Data;


@Component({
    selector:    'app-user-item',
    templateUrl: './user-item.component.html',
    styleUrls:  ['./user-item.component.scss']
})
export class UserItemComponent {
    @Input() user?: User;
}
