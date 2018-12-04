import { Component, OnInit } from '@angular/core';
import { Router            } from '@angular/router';
import { MatDialog         } from '@angular/material/dialog';
import { PageHeaderService } from '@services/page-header';
import { RoutingService    } from '@services/routing';
import { SessionService    } from '@services/session';
import { Subscriber        } from '@utils/subscriber';
import { ButtonLink, ToolButton                 } from '@common/interfaces';
import { MessageBoxComponent, MessageBoxOptions } from '@vee/components/message-box';

import * as RxO from 'rxjs/operators';


@Component({
    selector:    'app-root',
    templateUrl: './app.component.html',
    styleUrls:  ['./app.component.scss']
})
export class AppComponent extends Subscriber implements OnInit {
    menuButtons: ButtonLink[] = [];
    filteredToolButtons: ToolButton[] = [];

    constructor(
        public pageHeader: PageHeaderService,
        public rt:         RoutingService,
        public session:    SessionService,
        private dialog:    MatDialog,
        private router:    Router
    ) {
        super();
        this.subscrs.usr = this.session.$user.subscribe(() => {
            this.menuButtons = [{
                name: 'Home',
                routerLink: rt.to.home()
            }, {
                name: 'Courses',
                routerLink: rt.to.courses()
            }, {
                name: 'About',
                routerLink: rt.to.about()
            }, {
                name: 'API',
                routerLink: rt.to.developer()
            }];
            if (rt.canAccess(rt.to.users)) {
                this.menuButtons.splice(1, 0,  {
                    name: 'Users',
                    routerLink: rt.to.users()
                });
            }
            if (rt.canAccess(rt.to.groups)) {
                this.menuButtons.splice(1, 0, {
                    name: 'Groups',
                    routerLink: rt.to.groups()
                });
            }
            this.filterToolButtons();
        });
        this.subscrs.tb = this.pageHeader.$toolButtons.subscribe(() => (
            this.filterToolButtons()
        ));
    }

    filterToolButtons() {
        this.filteredToolButtons = (this
            .pageHeader
            .toolButtons || [])
            .filter(button => this.rt.canAccess(button.routerLink.pathFn));
    }

    ngOnInit() {
        this.subscrs.onLogout = this.session.onLogout.subscribe(
            () => this.router.navigateByUrl(this.rt.to.login())
        );
        this.subscrs.onExpired = this.session.onExpired.pipe(RxO.map(() =>
            this.dialog.open<MessageBoxComponent, MessageBoxOptions>(
                MessageBoxComponent,
                {
                    data: {
                        contentHtml: 'Your session token has expired. Log in please.',
                        titleHtml:   'Session expired'
                    }
                }
            ).afterClosed()
        )).subscribe(() => this.router.navigateByUrl(this.rt.to.login()));
    }
}
