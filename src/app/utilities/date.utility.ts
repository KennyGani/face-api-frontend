import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DateUtility {
    public convertDateToDDMMYYYYString(dateInISOString: string): string {
        const convertedDate = dateInISOString.toString().replace(/T.*/, '').split('-').reverse().join('-');

        return convertedDate;
    }
}
