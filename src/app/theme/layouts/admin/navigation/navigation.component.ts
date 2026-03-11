import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
    @Output() NavCollapsedMob = new EventEmitter();
    windowWidth = window.innerWidth;

    navCollapseMob() {
        if (this.windowWidth < 1025) {
            this.NavCollapsedMob.emit();
        }
    }
}
