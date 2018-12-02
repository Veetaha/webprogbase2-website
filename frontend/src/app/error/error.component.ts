import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }    from '@angular/router';
import { Subscriber }        from '@utils/subscriber';
import * as Vts            from 'vee-type-safe';
import * as HttpCodes        from 'http-status-codes';
import { PageHeaderService } from '@services/page-header';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent extends Subscriber implements OnInit {
    private static readonly DefaultStatus  = HttpCodes.NOT_FOUND;
    private static readonly DefaultMessage = 'Not found';
    message = ErrorComponent.DefaultMessage;
    status  = ErrorComponent.DefaultStatus;
    get errorName() {
        return HttpCodes.getStatusText(this.status) || 'Unknown error';
    }


    constructor(
        private pageHeader: PageHeaderService,
        private route: ActivatedRoute
    ) {
        super();
    }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Error' });
        this.subscrs.params = this.route.params.subscribe(params => {
            this.status = Vts.defaultIfNotConforms(
                Vts.isPositiveInteger,
                parseInt(String(params.status), 10),
                ErrorComponent.DefaultStatus
            );
            this.message = params.message || ErrorComponent.DefaultMessage;
        });
    }

}
