import * as Api from '@public-api/v1';
import * as Types from 'vee-type-safe';
import { ParamMap } from '@angular/router';
import { Identifiable } from '@common/interfaces';
import { PaginationComponent } from '@vee/components/pagination';

export function updatePagination<T>(pagination: PaginationComponent<T>) {
    return (paramMap: ParamMap) => pagination.doSearchRequest(parsePagination(
        paramMap, pagination.pagination
    ));
}

export function getId({ id }: Identifiable) {
    return id;
}

export function trackById(_index: number, { id }: Identifiable) {
    return id;
}

export function byId(id: string) {
    return (suspect: Identifiable) => suspect.id === id;
}

export function clamp(value: number, min: number, max: number) {
    return value > max ? max : (value < min ? min : value);
}

// Taken from https://stackoverflow.com/a/6969486/9259330
export function escapeStringRegExp(string: string) {
    return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}


export function parsePagination(
    params: ParamMap, defaultArgs: Api.PaginationArgs
): Api.PaginationArgs {
    return {
        limit: Types.defaultIfNotConforms(
            Types.isPositiveInteger,
            parseInt(params.get('limit') || '', 10),
            defaultArgs.limit
        ),
        page: Types.defaultIfNotConforms(
            Types.isPositiveInteger,
            parseInt(params.get('page') || '', 10),
            1
        ),
        search: params.get('search') || ''
    };
}

export function pagesAmount(
    limit: number,
    paginatedRes?: Api.Paginated | null
) {
    return paginatedRes ? Math.ceil(paginatedRes.total / limit) : 0;
}

export function nextTick<T extends () => void>(fn: T): void {
    setTimeout(fn, 0);
}
