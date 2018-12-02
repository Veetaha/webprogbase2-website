import * as HttpCodes from 'http-status-codes';
import { Errors } from 'veetaha-web';
import * as Vts from 'vee-type-safe';

export const StatusedError = Errors.StatusedError;

export function badRequest(errorMessage: string) {
    return new StatusedError(errorMessage, HttpCodes.BAD_REQUEST);
}

export function notFound(errorMessage: string) {
    return new StatusedError(errorMessage, HttpCodes.NOT_FOUND);
}

export function invalidJwt(mismatch: Vts.MismatchInfo) {
    return new StatusedError(
        `invalid authentication token (${mismatch.toErrorString()}) `,
        HttpCodes.UNAUTHORIZED
    );
}

export function unauthorized(message = 'authorization needed') {
    return new StatusedError(message, HttpCodes.UNAUTHORIZED);
}

export function forbidden(message = 'insufficient access level') {
    return new StatusedError(message, HttpCodes.FORBIDDEN);
}