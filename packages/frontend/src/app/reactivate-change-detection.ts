import {AfterViewInit, ApplicationRef, NgModule, OnDestroy, Type} from "@angular/core";
import {Subscription} from "rxjs";
import {ThrottleTime} from "@glut/admin-core";

export function observeAction() {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> | void {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            if (result && result.then) {
                result.then(() => {
                    ReactiveChangeDetectionModule.tick();
                }, () => {
                    ReactiveChangeDetectionModule.tick();
                });
            } else {
                ReactiveChangeDetectionModule.tick();
            }

            return result;
        };

        return descriptor;
    };
}

function lazyInitialize(target: any, name: string = '__observableValues'): any {
    if (!target[name]) {
        target[name] = {};

        Object.defineProperty(target, name, {
            enumerable: false,
            configurable: false,
            value: target[name]
        });
    }

    return target[name];
}

/**
 * Automatically unsubscribes the value (calling unsubscribe() on the current value)
 * when ngOnDestroy is called or a new value has been set.
 */
export function unsubscribe<T extends OnDestroy>() {
    return function (target: T, propertyKey: string | symbol) {
        const constructor = target.constructor;

        function unsub(value: any) {
            if (value && value.unsubscribe) {
                value.unsubscribe();
            }
        }

        Object.defineProperty(target, propertyKey, {
            enumerable: true,
            configurable: false, //even with true the prop cant be deleted using `delete this.name`
            get() {
                const store = lazyInitialize(this);
                return store[propertyKey];
            },

            set(value) {
                const store = lazyInitialize(this);
                unsub(store[propertyKey]);
                store[propertyKey] = value;
            }
        });

        const ngOnDestroy = constructor.prototype.ngOnDestroy;

        constructor.prototype.ngOnDestroy = function (...args: any[]) {
            const store = lazyInitialize(this);
            if (store[propertyKey]) {
                unsub(store[propertyKey]);
            }

            ngOnDestroy && ngOnDestroy.apply(this, args);
        };
    };
}

/**
 * Important for components that use material design, which need Tick in AfterViewInit.
 */
export function reactiveComponent<T extends AfterViewInit>() {
    return function (target: Type<T>) {
        const ngAfterViewInit = target.prototype.ngAfterViewInit;
        // console.log('ngAfterViewInit', target.prototype, ngAfterViewInit);

        target.prototype.ngAfterViewInit = function (...args: any[]) {
            ngAfterViewInit && ngAfterViewInit.apply(this, args);
            ReactiveChangeDetectionModule.tick();
        };
    };
}

/**
 * Automatically subscribes on the value (when set) to trigger application ticks automatically.
 * When value is changed, the old subscription is cancelled and a new on the new value is created.
 *
 * Optionally @observe({unsubscribe: true}) unsubscribes the whole value as well (calling unsubscribe() on current value) on NgOnDestroy or when net property value is set.
 */
export function observe<T extends OnDestroy>(options: {unsubscribe?: true} = {}) {
    return function (prototype: T, propertyKey: string | symbol) {
        const constructor = prototype.constructor;

        Object.defineProperty(prototype, propertyKey, {
            enumerable: true,
            configurable: false, //even with true the prop cant be deleted using `delete this.name`
            get() {
                const store = lazyInitialize(this);
                return store[propertyKey];
            },

            set(value) {
                const store = lazyInitialize(this);
                const subscriptions = lazyInitialize(this, '__subscriptions');

                if (subscriptions[propertyKey]) {
                    (subscriptions[propertyKey] as Subscription).unsubscribe();
                    delete subscriptions[propertyKey];
                }

                if (options.unsubscribe && store[propertyKey] && store[propertyKey].unsubscribe) {
                    store[propertyKey].unsubscribe();
                }

                if (value && value.subscribe) {
                    subscriptions[propertyKey] = value.subscribe(() => {
                        ReactiveChangeDetectionModule.tick();
                    });
                }

                ReactiveChangeDetectionModule.tick();

                store[propertyKey] = value;
            }
        });

        const ngOnDestroy = constructor.prototype.ngOnDestroy;

        constructor.prototype.ngOnDestroy = function (...args: any[]) {
            const store = lazyInitialize(this);
            const subscriptions = lazyInitialize(this, '__subscriptions');

            if (subscriptions[propertyKey]) {
                subscriptions[propertyKey].unsubscribe();
                delete subscriptions[propertyKey];
            }

            if (options.unsubscribe && store[propertyKey] && store[propertyKey].unsubscribe) {
                store[propertyKey].unsubscribe();
            }

            ngOnDestroy && ngOnDestroy.apply(this, args);
        };
    };
}

@NgModule({})
export class ReactiveChangeDetectionModule {
    private static a: ApplicationRef;
    // private static lastAnimationFrame?: number;
    private static throttled: Function;

    constructor(a: ApplicationRef) {
        ReactiveChangeDetectionModule.a = a;

        ReactiveChangeDetectionModule.throttled = ThrottleTime(() => {
            console.debug('tick');
            ReactiveChangeDetectionModule.a.tick();
        }, 30);
    }

    public static tick() {
        requestAnimationFrame(() => {
            ReactiveChangeDetectionModule.throttled();
        });

        // if (ReactiveChangeDetectionModule.lastAnimationFrame) {
        //     cancelAnimationFrame(ReactiveChangeDetectionModule.lastAnimationFrame);
        //     delete ReactiveChangeDetectionModule.lastAnimationFrame;
        // }
        //
        // ReactiveChangeDetectionModule.lastAnimationFrame = requestAnimationFrame(() => {
        //     console.log('tick');
        //     ReactiveChangeDetectionModule.a.tick();
        // });
    }
}
