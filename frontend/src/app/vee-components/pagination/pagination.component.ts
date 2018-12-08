import { 
	Component, 
	Directive,
	Input, 
	TemplateRef,
	ContentChild,
	OnInit
} from '@angular/core';
import { Defaults                     } from '@services/config';
import { ErrorHandlingService         } from '@services/error-handling';
import { PageHeaderService            } from '@services/page-header';
import { Pagination, Paginated, Maybe } from '@common/interfaces';

import * as Rx from 'rxjs';

export type PageFetcher<T> = (pagination: Pagination) => Rx.Observable<Paginated<T>>;
export interface PaginationContext<T> {
    $implicit: T[];
}

@Directive({ selector: '[veePaginated]' })
export class PaginatedDirective {}

@Component({
    selector: 	 'vee-pagination',
    templateUrl: './pagination.component.html',
    styleUrls:  ['./pagination.component.scss']
})
export class PaginationComponent<TData> implements OnInit {
    @Input() searchInputPlaceholder = 'Type here to search';
    @Input() nothingWasFoundMessage = 'Nothing was found';
    @Input() showFirstLastButtons   = true;
    @Input() pageSizeOptions        = Defaults.PaginationPageSizeOptions;
    @Input() refetchOn?: Maybe<Rx.Observable<Maybe<Partial<Pagination>>>> = null;
    @Input() noInitFetch            = false;
    @Input('pageFetcher') fetchPage!: PageFetcher<TData>;
    @Input() set refetchOnChanged(_value: unknown) {
        this.doSearchRequest({ page: 1 });
    }


    @ContentChild(PaginatedDirective, { read: TemplateRef }) 
    templateRef?: TemplateRef<PaginationContext<TData>>;
  	    
  	dataPage?: Maybe<Paginated<TData>>;
  	pagination = { ...Defaults.Pagination };
    

  	constructor(
        private pageHeader: PageHeaderService,
        private errHandler: ErrorHandlingService
    ) {}

  	ngOnInit() {
        if (!this.noInitFetch) {
  		    this.doSearchRequest({ page: 1 });
        }
        if (this.refetchOn) {
            this.refetchOn.subscribe(
                pagination => this.doSearchRequest(pagination || {}),
                err => this.errHandler.handle(err)
            );
        }
  	}

  	doSearchRequest({
  		page   = this.pagination.page,
  		limit  = this.pagination.limit,
  		search = this.pagination.search
  	}: Partial<Pagination> = this.pagination) {
  		this
          .fetchPage({ page, limit, search })
          .pipe(this.pageHeader.displayLoading())
  		  .subscribe(
              data => { 
                this.pagination = { page, limit, search };
                this.dataPage = data;
              },
              err  => this.errHandler.handle(err)
          );
  	}

}
