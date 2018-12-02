import { NgModule         } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { InMemoryCache    } from 'apollo-cache-inmemory';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink     } from 'apollo-angular-link-http';

const uri = '/api/v1/gql'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink) {
    return {
        link: httpLink.create({uri}),
        cache: new InMemoryCache(),
    };
}

@NgModule({
    imports: [
        HttpClientModule
    ],
    exports: [ApolloModule, HttpLinkModule],
    providers: [
        {
        provide: APOLLO_OPTIONS,
        useFactory: createApollo,
        deps: [HttpLink],
        },
    ],
})
export class GraphQLModule {}
