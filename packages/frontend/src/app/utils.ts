import {ActivatedRoute, ActivatedRouteSnapshot} from "@angular/router";
import {ClassType, getClassName} from "@marcj/estdlib";

export function findRouteParameterBySnapshot(snapshot: ActivatedRouteSnapshot, parameterName: string): string | undefined {
    if (snapshot.params[parameterName]) {
        return snapshot.params[parameterName];
    }

    for (let current = snapshot.parent; current; current = current.parent) {
        if (current.params[parameterName]) {
            return current.params[parameterName];
        }
    }

    for (let current = snapshot.firstChild; current; current = current.firstChild) {
        if (current.params[parameterName]) {
            return current.params[parameterName];
        }
    }
}

export function findRouteParameter(route: ActivatedRoute, parameterName: string): string {
    if (route.snapshot.params[parameterName]) {
        return route.snapshot.params[parameterName];
    }

    for (let current = route.parent; current; current = current.parent) {
        if (current.snapshot.params[parameterName]) {
            return current.snapshot.params[parameterName];
        }
    }

    for (let current = route.firstChild; current; current = current.firstChild) {
        if (current.snapshot.params[parameterName]) {
            return current.snapshot.params[parameterName];
        }
    }

    throw new Error(`No parent route found for parameter ${parameterName}`);
}

export function findRouteComponent(route: ActivatedRoute, parentComponent: ClassType<any>): ActivatedRoute {
    if (route.component === parentComponent) {
        return route;
    }

    for (let current = route.parent; current; current = current.parent) {
        if (current.component === parentComponent) {
            return current;
        }
    }

    for (let current = route.firstChild; current; current = current.firstChild) {
        if (current.component === parentComponent) {
            return current;
        }
    }

    throw new Error(`No parent route found for component ${getClassName(parentComponent)}`);
}

export function getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
        .map(v => v.url.map(segment => segment.toString()).join('/'))
        .join('/');
}

export function getConfiguredPath(route: ActivatedRouteSnapshot): string {
    return '/' + route.pathFromRoot
        .filter(v => v.routeConfig)
        .map(v => v.routeConfig!.path)
        .join('/');
}

export function getResolvedUrlIncludingChildren(route: ActivatedRouteSnapshot): string {
    const parts = [getResolvedUrl(route)];

    let deepestChild = route;
    while (deepestChild.firstChild) {
        deepestChild = deepestChild.firstChild;
        parts.push(deepestChild.url.join('/'));
    }

    return parts.join('/');
}
