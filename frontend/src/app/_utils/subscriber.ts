import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import * as Types from 'vee-type-safe';

export class Subscriber implements OnDestroy {
    protected subscrs: Types.BasicObject<Subscription> = {};
    
    ngOnDestroy() {
        Object.values(this.subscrs).forEach(subscr => {
            if (subscr) subscr.unsubscribe();
        });
    }

}
