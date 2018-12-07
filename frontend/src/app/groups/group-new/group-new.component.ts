import { Component, OnInit      } from '@angular/core';
import { Router                 } from '@angular/router';
import { Subscriber             } from '@utils/subscriber';
import { PageHeaderService      } from '@services/page-header';
import { RoutingService         } from '@services/routing';
import { ErrorHandlingService   } from '@services/error-handling';
import { Defaults               } from '@services/config';
import { GroupsService          } from '@services/groups';
import { CoursesService         } from '@services/courses';
import { UsersService           } from '@services/users';
import { trackById              } from '@utils/helpers';
import { 
    StudentsSelectionManager, 
    CoursesSelectionManager 
} from '@utils/selection-manager';


@Component({
    selector:    'app-group-new',
    templateUrl: './group-new.component.html',
    styleUrls:  ['./group-new.component.scss']
})
export class GroupNewComponent extends Subscriber implements OnInit {
    newGroup = {
        name: ''
    };

    stLists: StudentsSelectionManager;
    crLists: CoursesSelectionManager;

    readonly pageSizeOptions = Defaults.PaginationPageSizeOptions;
    readonly trackById = trackById;

    constructor(
        private pageHeader:     PageHeaderService,
        private groupsService:  GroupsService,
        private router:         Router,
        private errHandler:     ErrorHandlingService,
        public  rt:             RoutingService,
        coursesService:         CoursesService,
        usersService:           UsersService
    ) {
        super();
        this.stLists = new StudentsSelectionManager(errHandler, usersService);
        this.crLists = new CoursesSelectionManager(errHandler, coursesService);
    }

    ngOnInit() {
        this.stLists.init();
        this.crLists.init();
        this.pageHeader.setHeader({ title: 'New group' });
    }

    onFormSubmit() {
        this.groupsService
            .createGroup({
                name:    this.newGroup.name,
                members: this.stLists.chosen.map(member => member.id),
                courses: this.crLists.chosen.map(course => course.id)
            })
            .pipe(this.pageHeader.displayLoading())
            .subscribe(
                res => this.router.navigateByUrl(this.rt.to.group(
                    res.data!.createGroup.group.id
                )),
                err => this.errHandler.handle(err)
            );
    }

    

}
