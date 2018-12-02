export function shutdown(reason = 'undefined behaviour'): never {
    debugger;
    console.error(new Error(reason));
    return process.exit(1);
}

export function log(arg: unknown) {
    return console.dir(arg);
}

export function assertFalsy(falsy: unknown) {
    if (falsy) {
        log(falsy);
        shutdown(`assertion failure`);
    }
}

export function assert(truthy: unknown) {
    if (!truthy) {
        log(truthy);
        shutdown(`assertion failure`);
    }
}
export function error(arg: string) {
    return shutdown(arg);
}