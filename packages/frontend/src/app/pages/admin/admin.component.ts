import {Component, OnDestroy} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Breadcrumbs} from "../../providers/breadcrumbs";

@Component({
    template: `
        <a class="breadcrumb-item link"
             [routerLink]="['/admin']"
        >Administration</a>
    `
})
export class AdminBreadCrumbComponent {

}

@Component({
    template: `
        <div class="main-container">
            <div
                *ngIf="route|routeSegmentEmpty:2"
                class="tabs">
                <button 
                        [class.active]="route|activeRoute:1:'user'"
                        [routerLink]="['/admin', 'user']">Users</button>
                <button 
                        [class.active]="route|activeRoute:1:'permissions'"
                        [routerLink]="['/admin', 'permissions']">Permissions</button>
            </div>
            
            <div>
                <router-outlet></router-outlet>
            </div>
        </div>

    `
})
export class AdminComponent implements OnDestroy {
    constructor(
        public route: ActivatedRoute,
        public breadcrumbs: Breadcrumbs,
    ) {
        this.breadcrumbs.addBreadCrumbTitle(AdminComponent, 'Administration');
    }

    ngOnDestroy(): void {
        this.breadcrumbs.deleteBreadCrumbs(AdminComponent);
    }

}
