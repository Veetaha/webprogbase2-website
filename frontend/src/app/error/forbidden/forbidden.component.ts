import { Component, OnInit } from '@angular/core';
import { ActivatedRoute    } from '@angular/router';
import { Subscriber        } from '@utils/subscriber';
import { PageHeaderService } from '@services/page-header';

@Component({
  selector:    'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls:  ['./forbidden.component.scss']
})
export class ForbiddenComponent extends Subscriber implements OnInit {
    private static readonly DefaultMessage = 'Access denied. Appeal to administrator, please.';
    message = ForbiddenComponent.DefaultMessage;

    constructor(
        private pageHeader: PageHeaderService,
        private route: ActivatedRoute
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Forbidden' });
        this.subscrs.params = this.route.params.subscribe(params => {
            this.message = params.message || ForbiddenComponent.DefaultMessage;
        });
    }

}
