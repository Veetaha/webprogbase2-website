import { Component, Input } from '@angular/core';

@Component({
    selector: 	 'vee-file-download',
    templateUrl: './file-download.component.html',
    styleUrls:  ['./file-download.component.scss']
})
export class FileDownloadComponent {
    @Input() href!: string;
    @Input() fileName = 'veetaha-attachment';
}
