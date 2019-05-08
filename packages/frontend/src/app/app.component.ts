import {ApplicationRef, ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {ReactiveChangeDetectionModule} from "./reactivate-change-detection";
import {ActivationEnd, Event, NavigationEnd, Router} from "@angular/router";
import {ControllerClient} from "./providers/controller-client";

@Component({
    selector: 'app-root',
    template: `
        <div>
            <router-outlet></router-outlet>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
    constructor(
        router: Router,
        a: ApplicationRef,
        private controllerClient: ControllerClient,
    ) {
        //necessary to render all router-outlet once the router changes
        router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd || event instanceof ActivationEnd) {
                a.tick();
            }
        });

        document.addEventListener('click', () => ReactiveChangeDetectionModule.tick());
        document.addEventListener('focus', () => ReactiveChangeDetectionModule.tick());
        document.addEventListener('blur', () => ReactiveChangeDetectionModule.tick());
        document.addEventListener('keydown', () => ReactiveChangeDetectionModule.tick());
        document.addEventListener('keyup', () => ReactiveChangeDetectionModule.tick());
        document.addEventListener('keypress', () => ReactiveChangeDetectionModule.tick());
    }

    ngOnDestroy(): void {
    }
}
