import { Component, Input } from '@angular/core';
import { RoutingService   } from '@services/routing';

import * as Gql   from '@services/gql';

import User   = Gql.GetUsers.Data;


@Component({
    selector:    'app-user-item',
    templateUrl: './user-item.component.html',
    styleUrls:  ['./user-item.component.scss']
})
export class UserItemComponent {
    @Input() user?: User;
    private _provideLink = false;
    @Input() set provideLink(value: unknown) {
        this._provideLink = value === '' || !!value;
    } 
    get provideLink() {
        return this._provideLink;
    }

    constructor(
        public rt: RoutingService
    ) {}
}
