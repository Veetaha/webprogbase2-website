import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
import { Maybe           } from '@common/interfaces';
import { nextTick        } from '@utils/helpers';
import * as Prism from 'prismjs';

@Component({
    selector: 	 'vee-markdown-editor',
    templateUrl: './markdown-editor.component.html',
    styleUrls:  ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {
    private _sourceText = '';

    @Input() textareaId?: Maybe<string> = 'markdownTextId';
    @Input() rows = 12;
    @Input() set sourceText(value: string) {
        this._sourceText = value;
        this.sourceTextChange.emit(value);
    }
    get sourceText() {
        return this._sourceText;
    }

    @Input() name = 'markdownText'
    @Output() sourceTextChange = new EventEmitter<string>();
 

    editorOptions: { parser: (input: string) => string; };
    
  	constructor(private markdown: MarkdownService) {
        this.editorOptions = {
            parser: input => {
                nextTick(Prism.highlightAll);
                return this.markdown.compile(input.trim());
            }
        };
    }

  	ngOnInit() {
          
    }

}
