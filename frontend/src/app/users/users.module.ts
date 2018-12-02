import { NgModule }         from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { UsersRoutingModule } from '@routes/users';

import { UsersComponent    } from './users.component';
import { UserComponent     } from './user/user.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { LoginComponent    } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { AppCommonModule } from '@common/app-common.module';


@NgModule({
    imports:      [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,

        AppCommonModule,

        UsersRoutingModule,
        HttpClientModule,
    ],
    declarations: [
        UserEditComponent,
        UserComponent,
        UsersComponent,
        LoginComponent,
        RegisterComponent
    ]
})
export class UsersModule {
}
