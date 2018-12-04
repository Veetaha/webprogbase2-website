import { Component, OnInit } from '@angular/core';
import { PageHeaderService } from '@services/page-header';
import { SessionService    } from '@services/session';
import { RoutingService    } from '@services/routing';
import { MatSnackBar       } from '@angular/material/snack-bar';


@Component({
    selector:    'app-developer',
    templateUrl: './developer.component.html',
    styleUrls:  ['./developer.component.scss']
})
export class DeveloperComponent implements OnInit {
    constructor(
        private snackBar:  MatSnackBar,
        public  pageHeader: PageHeaderService,
        public  session:    SessionService,
        public  rt:         RoutingService
    ) {}
    public loginRequestSample = (
`{
    "login": "login_string",
    "password": "password_string"
}`);
    public registerRequestSample = (
`{
    "login": "login_string",
    "password": "password_string",
    "fullname": "fullname_string"
}`);
    public authResponseSample = (
`{
    "jwt": "encoded_json_webtoken_here"
}`);

    public restJsonErrorSample = (
`{
    "error": "error_message_string"
}`
);


    public gqlJsonErrorSample = (
`{                                 
    "error": {
        "errors": [                                         
            {                                         
                "message": "Error message",                                         
                "locations": [                                         
                    {                                         
                        "line": 1,                                         
                        "column": 1                                         
                    }                                         
                ]                                         
            }                                         
        ]                                         
    }                                        
}`);

    onTokenCopied() {
        this.snackBar.open('Your bearer token was copied to clipboard.',
        '', // Action
        {
            duration: 1500 // ms
        });
    }

    ngOnInit() {
        this.pageHeader.setHeader({ title: 'API reference' });
    }
}
