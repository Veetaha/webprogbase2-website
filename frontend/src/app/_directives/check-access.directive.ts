import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { RoutingService } from '@services/routing';
import { RouteFn        } from '@routes/paths';

@Directive({
    selector: '[appCheckAccess]'
})
export class CheckAccessDirective {
    private hasView = false;

    constructor(
        private templateRef:   TemplateRef<unknown>,
        private viewContainer: ViewContainerRef,
        private rt:            RoutingService
    ) { }

    @Input() set appCheckAccess(access: RouteFn) {
        const canAccess = this.rt.canAccess(access);
        if (canAccess && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!canAccess && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }



}
