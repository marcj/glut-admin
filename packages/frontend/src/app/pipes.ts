import {Pipe, PipeTransform} from '@angular/core';
import {Observable} from "rxjs";
import {auditTime} from "rxjs/internal/operators";
import {animationFrame} from "rxjs/internal/scheduler/animationFrame";
import {humanBytes} from "@marcj/estdlib";
import {humanizeTime} from "@glut/admin-core";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {Buffer} from "buffer";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Pipe({name: 'humanize', pure: false})
export class HumanizePipe implements PipeTransform {
    transform(value: Date | number | null, def = '00:00:00'): string {
        if (value instanceof Date) {
            value = value.getTime() / 1000;
        }

        return value === null ? def : humanizeTime(value);
    }
}

@Pipe({name: 'humanize_until_now', pure: false})
export class HumanizeUntilNowPipe implements PipeTransform {
    transform(value: Date | number | null, def = '00:00:00'): string {
        if (value instanceof Date) {
            value = value.getTime() / 1000;
        }

        return value === null ? def : humanizeTime((new Date().getTime() / 1000) - value);
    }
}

@Pipe({name: 'throttle'})
export class ThrottlePipe<T> implements PipeTransform {
    //10 means 10 updates per seconds
    transform(observable: Observable<T>, cps: number = 10): Observable<T> {
        return observable.pipe(
            auditTime(1000 / cps, animationFrame)
        );
    }
}

export function getAllRouteSegments(route: ActivatedRoute): UrlSegment[] {
    const segments = [];

    for (let i = route.parent; i; i = i.parent) {
        segments.unshift(...i.snapshot.url);
    }

    for (let i: ActivatedRoute | null = route; i; i = i.firstChild) {
        segments.push(...i.snapshot.url);
    }

    return segments;
}

@Pipe({name: 'activeRoute', pure: false})
export class ActiveRoutePipe<T> implements PipeTransform {
    transform(route: ActivatedRoute, position: number, path: string): boolean {
        const segments = getAllRouteSegments(route);
        if (segments[position] && segments[position].path === path) {
            return true;
        }

        return false;
    }
}

@Pipe({name: 'routeSegmentEmpty', pure: false})
export class RouteSegmentEmptyPipe<T> implements PipeTransform {
    transform(route: ActivatedRoute, position: number): boolean {
        const segments = getAllRouteSegments(route);
        if (!segments[position]) {
            return true;
        }

        return false;
    }
}

@Pipe({name: 'childrenRouteActive', pure: false})
export class ChildrenRouteActivePipe<T> implements PipeTransform {
    transform(route: ActivatedRoute, depth: number = 1): boolean {
        for (let i = 0; i < depth; i++) {
            if (!route.firstChild) {
                return false;
            }
            route = route.firstChild;
        }

        return true;
    }
}

@Pipe({name: 'dataUri', pure: false})
export class DataUriPipe<T> implements PipeTransform {

    constructor(private domSanitization: DomSanitizer) {}

    transform(buffer: Buffer | undefined, depth: number = 1): SafeUrl | undefined {
        if (buffer) {
            return this.domSanitization.bypassSecurityTrustUrl('data:;base64,' + buffer.toString('base64'));
        }
    }
}

@Pipe({name: 'observe'})
export class ObservePipe<T> implements PipeTransform {
    transform(item: T, observable: Observable<any>): Observable<T> {
        return new Observable<T>((observer) => {
            observer.next(item);

            const sub = observable.subscribe(() => {
                observer.next(item);
            }, (error) => {
                observer.error(error);
            }, () => {
                observer.complete();
            });

            return {
                unsubscribe(): void {
                    sub.unsubscribe();
                }
            };
        });
    }
}

@Pipe({name: 'keys'})
export class KeysPipe<T> implements PipeTransform {
    //10 means 10 updates per seconds
    transform(value: object): string[] {
        return Object.keys(value);
    }
}

@Pipe({name: 'fileSize'})
export class HumanFileSizePipe implements PipeTransform {
    transform(bytes: number, si: boolean = false): string {
        return humanBytes(bytes, si);
    }
}

@Pipe({
    name: 'callback',
    pure: false
})
export class CallbackPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}

@Pipe({
    name: 'range'
})
export class RangePipe implements PipeTransform {
    private array: number[] = [];

    transform(items: number): number[] {
        if (this.array.length !== items) {
            this.array = [];
            for (let i = 0; i < items; i++) {
                this.array.push(i);
            }
        }
        return this.array;
    }
}
