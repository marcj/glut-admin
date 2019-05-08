import {Injectable} from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
    UrlTree
} from "@angular/router";
import {ControllerClient} from "./controller-client";
import {hasRole, RoleType} from "@glut/admin-core";

async function checkRoute(url: string, requiredRole: RoleType, controllerClient: ControllerClient): Promise<true | string> {
    if (url === '/login') {
        return true;
    }

    if (!controllerClient.isLoggedIn() && controllerClient.hasToken()) {
        //try to login
        try {
            await controllerClient.loadUser();
        } catch (error) {
            //error means we need to login.
        }
    }

    const currentRole = controllerClient.isLoggedIn() ? controllerClient.getUser().value.role : RoleType.anonymouse;

    if (hasRole(currentRole, requiredRole)) {
        return true;
    }

    if (requiredRole > RoleType.anonymouse && controllerClient.isLoggedIn()) {
        return '/login?insufficientPermissions=1&redirect=' + encodeURIComponent(url);
    }

    return '/login?redirect=' + encodeURIComponent(url);
}

function getNearestRole(route: ActivatedRouteSnapshot): RoleType {
    //first get deepest
    while (route.firstChild) {
        route = route.firstChild;
    }

    let current: ActivatedRouteSnapshot | null = route;
    do {
        if (undefined !== current.data.role) {
            return current.data.role;
        }

        current = current.parent;
    } while (current);

    return RoleType.anonymouse;
}

@Injectable()
export class CanActivateRoute implements CanActivateChild, CanActivate {
    constructor(
        private router: Router,
        private controllerClient: ControllerClient,
    ) {
    }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        const result = await checkRoute(state.url, getNearestRole(route), this.controllerClient);

        if (result === true) {
            return true;
        }

        return this.router.parseUrl(result);
    }

    async canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {

        const result = await checkRoute(state.url, getNearestRole(route), this.controllerClient);
        if (result === true) {
            return true;
        }


        return this.router.parseUrl(result);

    }
}
