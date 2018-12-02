import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonLink } from '@common/interfaces';

@Component({
  selector: 'vee-slide-menu',
  templateUrl: './slide-menu.component.html',
  styleUrls: ['./slide-menu.component.scss']
})
export class SlideMenuComponent {
    @Input()  activeButton?: ButtonLink;
    @Input()  buttons!:      ButtonLink[];
    @Output() itemSelected = new EventEmitter<ButtonLink>();
    @Input()  open = false;
    @Output() openChange = new EventEmitter<boolean>();

    trackButtons(_index: number, button: ButtonLink) {
        return button.name;
    }

}





