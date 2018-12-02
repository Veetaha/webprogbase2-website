import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from '@services/page-header';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
    constructor(
        private pageHeader: PageHeaderService
    ) {}

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'About' });
    }
}
