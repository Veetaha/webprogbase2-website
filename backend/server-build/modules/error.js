"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Apollo = require("apollo-server-express");
const HttpCodes = require("http-status-codes");
const veetaha_web_1 = require("veetaha-web");
exports.StatusedError = veetaha_web_1.Errors.StatusedError;
function badRequest(errorMessage) {
    return new exports.StatusedError(errorMessage, HttpCodes.BAD_REQUEST);
}
exports.badRequest = badRequest;
function notFound(errorMessage) {
    return new exports.StatusedError(errorMessage, HttpCodes.NOT_FOUND);
}
exports.notFound = notFound;
function notFoundGql(errorMessage) {
    return new Apollo.ValidationError(errorMessage);
}
exports.notFoundGql = notFoundGql;
function invalidJwt(mismatch) {
    return new exports.StatusedError(`invalid authentication token (${mismatch.toErrorString()}) `, HttpCodes.UNAUTHORIZED);
}
exports.invalidJwt = invalidJwt;
function unauthorized(message = 'authorization needed') {
    return new exports.StatusedError(message, HttpCodes.UNAUTHORIZED);
}
exports.unauthorized = unauthorized;
function forbidden(message = 'insufficient access level') {
    return new exports.StatusedError(message, HttpCodes.FORBIDDEN);
}
exports.forbidden = forbidden;
