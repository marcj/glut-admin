/**
 * Makes sure that given `call` is not more frequently called than cps/seconds. cps=5 means 5 times per seconds max.
 *
 * @example const throttled = ThrottleTime(async () => { console.log('do it') }); throttled(); throttled(); ...
 *
 */
export function ThrottleTime(call: Function, cps = 5): (...args: any[]) => void {
    let last = Date.now();
    let dirty = false;
    let lastArgs: any[][] = [];
    let execution = false;

    function tick() {
        const now = Date.now();

        if (!execution && now - last > 1000 / cps) {
            execution = true;
            call(...lastArgs);
            dirty = false;
            last = Date.now();
            execution = false;
        }

        if (dirty) {
            requestAnimationFrame(tick);
        }
    }

    return (...args) => {
        dirty = true;
        lastArgs = args;
        tick();
    };
}

/**
 * This functions returns a stack that is filled as long as the gate is not activated.
 * Once activated all recorded calls go to given callback and subsequent calls go directly to given callback.
 */
export function BufferedGate<T>(callback: (arg: T) => any) {
    const q: T[] = [];
    let activated = false;

    const throttled = ThrottleTime(async () => {
        if (q.length === 0) return;

        for (const t of q) {
            const result = callback(t);
            if (result instanceof Promise) {
                await result;
            }
        }
        //empty the queue
        q.splice(0, q.length);
    });

    return {
        activate: () => {
            activated = true;
            throttled();
        },
        call: (i: T) => {
            q.push(i);

            if (activated) {
                throttled();
            }
        }
    };
}
