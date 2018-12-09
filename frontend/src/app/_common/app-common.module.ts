import { NgModule                    } from '@angular/core';
import { VeeComponentsModule         } from '@vee/components';
import { UcWidgetModule              } from 'ngx-uploadcare-widget';
import { ClipboardModule             } from 'ngx-clipboard';
import { JwtModule                   } from '@auth0/angular-jwt';
import { Defaults                    } from '@services/config';
import { PrismModule                 } from '@ngx-prism/core';

import { MaterialCommonModule } from './material-common.module';
import { CheckAccessDirective } from '@directives/check-access';
import { GraphQLModule        } from './graphql.module';
import { AppMarkdownModule    } from './app-markdown.module'

@NgModule({
    declarations: [ CheckAccessDirective ],
    imports: [
        JwtModule.forRoot({
            config: {
                tokenGetter: () => localStorage.getItem(Defaults.Token.StorageKey),
                whitelistedDomains: Defaults.Token.WhitelistedDomains,
                blacklistedRoutes:  Defaults.Token.BlacklistedRoutes
            }
        })

    ],
    exports: [
        CheckAccessDirective,
        MaterialCommonModule,
        
        UcWidgetModule,
        AppMarkdownModule,

        VeeComponentsModule,
        GraphQLModule,
        ClipboardModule,
        PrismModule
    ]
})
export class AppCommonModule { }
