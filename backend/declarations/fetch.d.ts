declare module 'fetch' {
    import { Types } from "veetaha-web";

    type CookieJar = unknown;

    export interface HttpMeta {
        status: number;                             // HTTP status code
        responseHeaders: Types.BasicObject<string>; // response headers
        finalUrl: string;                           // last url value, useful with redirects
        redirectCount: number;                      // how many redirects happened
        cookieJar: CookieJar;                       // CookieJar object for sharing/retrieving cookies
    }

    export type FetchUrlCB = (
        err:  Error    | null,
        meta: HttpMeta | undefined,
        body: Buffer   | undefined
    ) => void;


    export function fetchUrl(url: string, callbackfn: FetchUrlCB): void;


}