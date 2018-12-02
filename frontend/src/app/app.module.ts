import { NgModule                 } from '@angular/core';
import { BrowserModule            } from '@angular/platform-browser';
import { FormBuilder, FormsModule } from '@angular/forms';
import { HttpClientModule         } from '@angular/common/http';
import { BrowserAnimationsModule  } from '@angular/platform-browser/animations';

// --------------
import { AppComponent       } from '@app/app.component';
import { HomeComponent      } from '@app/home/home.component';
import { ForbiddenComponent } from '@app/error/forbidden/forbidden.component';

// --------------
import { AppRoutingModule   } from '@routes/app';
import { UsersModule        } from '@app/users/users.module';
import { CoursesModule      } from '@app/courses/courses.module';
import { ErrorComponent     } from '@app/error/error.component';
import { AboutComponent     } from '@app/about/about.component';
import { DeveloperComponent } from '@app/developer/developer.component';
import { AppCommonModule    } from '@common/app-common.module';

// --------------
import { HttpInterceptorProviders } from './_http-interceptors/index';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        // npm dependencies:
       
        AppCommonModule,

        // routing:
        CoursesModule,
        UsersModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        AboutComponent,
        DeveloperComponent,
        ErrorComponent,
        ForbiddenComponent
    ],
    providers: [
        FormBuilder,
        HttpInterceptorProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

/* @NgModule()
 *declarations: The components, directives, and pipes that belong to this NgModule.
 *
 *exports: The subset of declarations that should be visible
 *         and usable in the component templates of other NgModules.
 *
 *imports: Other modules whose exported classes are needed by component templates
 *         declared in this NgModule.
 *
 *providers: Creators of services that this NgModule contributes to
 *           the global collection of services; they become accessible in all parts of
 *           the app. (You can also specify providers at the component level, which is
 *           often preferred.)
 *
 *bootstrap: The main application view, called the root component, which hosts all other
 *           app views. Only the root NgModule should set the bootstrap property.
 */
