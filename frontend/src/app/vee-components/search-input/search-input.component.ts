import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'vee-search-input',
    templateUrl: './search-input.component.html',
    styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
    @Output() searchDemand = new EventEmitter<string>();
    @Input()  placeholder = '';
}
