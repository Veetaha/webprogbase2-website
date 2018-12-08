import { 
	Component, 
	Directive,
	Input, 
    Output,
    EventEmitter,
	TemplateRef,
	ContentChild,
  ViewChild
} from '@angular/core';
import { 
  Pagination, 
  Identifiable, 
  Maybe
} from '@common/interfaces';
import { MatSelectionListChange } from '@angular/material/list';
import { PageFetcher, PaginationComponent } from '@vee/components/pagination';
import { Defaults } from '@services/config';
import { byId, trackById } from '@utils/helpers';

import * as Rx from 'rxjs';

@Directive({ selector: '[veeChosenItem]' })
export class ChosenItemDirective {}

@Directive({ selector: '[veeFreeItem]' })
export class FreeItemDirective {}

export interface ListSelectorContext<TData extends Identifiable> {
    $implicit: TData;
}

@Component({
    selector: 	 'vee-list-selector',
    templateUrl: './list-selector.component.html',
    styleUrls:  ['./list-selector.component.scss']
})
export class ListSelectorComponent<TData extends Identifiable> {
    @ViewChild('freeListPaginationEl')
    freeListPageEl!: PaginationComponent<TData>;
    @Input() selectedListHeader         = 'Assigned';
    @Input() freeListHeader             = 'Unassigned';
    @Input() searchInputPlaceholder     = 'Type here to search';
    @Input() nothingIsChosenMessage     = 'Choose items from the list';
    @Input() noFreeItemsWereFoundMessage = 'Nothing was found';
    @Input() showFirstLastButtons       = false;
    @Input() pageSizeOptions            = Defaults.PaginationPageSizeOptions;
    @Input() refetchOn?: Maybe<Rx.Observable<Maybe<Partial<Pagination>>>> = null;
    @Input() noInitFetch                = false;
    @Input('pageFetcher') fetchPage!: PageFetcher<TData>;

    @Output() addedToChosen     = new EventEmitter<TData>();
    @Output() removedFromChosen = new EventEmitter<TData>();

    @Input() set refetchOnChanged(_value: unknown) {
        this.freeListPageEl.doSearchRequest({ page: 1 });
    }

    @ContentChild(FreeItemDirective, { read: TemplateRef }) 
    freeItemRef?: TemplateRef<ListSelectorContext<TData>>;

    @ContentChild(ChosenItemDirective, { read: TemplateRef })
    chosenItemRef?: TemplateRef<ListSelectorContext<TData>>;
  	    
    trackById = trackById;
    @Input()
    chosenItems: TData[] = [];

    get pageFetcher(): PageFetcher<TData> {
        return pagination => this.fetchPage(pagination);
    }

    onFreeSelectionListChange(
        { option: { value, selected }}: MatSelectionListChange
    ) {
        const changedItem = value as TData;
        if (selected) {
            this.chosenItems.push(changedItem);
            this.addedToChosen.emit(changedItem);
        } else {
            this.removeChosen(changedItem);
            this.removedFromChosen.emit(changedItem);
        }
    }

    onChosenSelectionListChange({ option: { value }}: MatSelectionListChange) {
        this.removeChosen(value);
    }

    private removeChosen({ id }: TData) {
        this.chosenItems.splice(this.chosenItems.findIndex(byId(id)), 1);
    }

    isSelected({ id }: TData) {
        return !!this.chosenItems.find(byId(id));
    }
}
