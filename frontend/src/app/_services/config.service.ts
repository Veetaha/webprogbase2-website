import { Injectable } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
import * as Prism from 'prismjs';
import * as Api from '@public-api/v1';

export namespace Defaults {
    export const PaginationPageSizeOptions = [5, 10, 20, 50, 100];
    export const Pagination: Api.PaginationArgs = {
        page: 1,
        limit: 5,
        search: ''
    };
    export namespace Token {
        export const StorageKey = 'veetaha-jwt';
        export const WhitelistedDomains = [
            'localhost:8080', 'localhost:3000', 'veetaha.herokuapp.com'
        ];
        export const BlacklistedRoutes = [ ];
    }
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(
        private markdown: MarkdownService
    ) { }

    makeMarkdownEditorOptions() {
        return {
            parser: (input: string) => {
                setTimeout(Prism.highlightAll, 0);
                return this.markdown.compile(input.trim());
            }
        };
    }
}
