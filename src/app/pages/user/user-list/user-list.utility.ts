import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UserListUtility {
    public getPageAttributeFromUrlQueryParam(): Record<string, number> {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const params = {
            page: 1,
        };

        if (
            urlParams.get('page') !== null &&
            urlParams.get('page')?.trim() &&
            !isNaN(parseInt(urlParams.get('page') as string))
        ) {
            params.page = parseInt(urlParams.get('page') as string);
        }

        return { page: params.page };
    }
}
