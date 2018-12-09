import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageHeaderService } from '@services/page-header';

@Component({
    selector: 	 'vee-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls:  ['./file-upload.component.scss']
})
export class FileUploadComponent {
    @Input() fileUrl!: string;
    @Input() imagesOnly = false;
    @Output() fileUrlChange = new EventEmitter<string>();

    constructor(
        private pageHeader: PageHeaderService
    ) {}

    onProgress() {
        this.pageHeader.loading = true;
    }
    
    onDownloadComplete(url: string) {
        this.fileUrl = url;
        this.pageHeader.loading = false;
        this.fileUrlChange.emit(url);
    }


}
