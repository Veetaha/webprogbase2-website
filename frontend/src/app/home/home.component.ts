import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from '@services/page-header';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(
        private pageHeader: PageHeaderService
    ) { }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'Home' });
    }

}
