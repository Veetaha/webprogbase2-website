"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shutdown(reason = 'undefined behaviour') {
    debugger;
    console.error(new Error(reason));
    return process.exit(1);
}
exports.shutdown = shutdown;
function log(arg) {
    return console.dir(arg);
}
exports.log = log;
function assertFalsy(falsy) {
    if (falsy) {
        log(falsy);
        shutdown(`assertion failure`);
    }
}
exports.assertFalsy = assertFalsy;
function assert(truthy) {
    if (!truthy) {
        log(truthy);
        shutdown(`assertion failure`);
    }
}
exports.assert = assert;
function error(arg) {
    return shutdown(arg);
}
exports.error = error;
