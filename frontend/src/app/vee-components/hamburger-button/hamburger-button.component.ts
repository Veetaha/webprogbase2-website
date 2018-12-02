import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'vee-hamburger-button',
  templateUrl: './hamburger-button.component.html',
  styleUrls: ['./hamburger-button.component.scss']
})
export class HamburgerButtonComponent {
    @Output() openChange = new EventEmitter<boolean>();
    @Input()  open = false;
}
