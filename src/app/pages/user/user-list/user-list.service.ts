import { Injectable } from '@angular/core';

import { UserProfileDtoOutput } from '../../../shared/face-recognition-api/dtos';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';

@Injectable({
    providedIn: 'root',
})
export class UserListService {
    constructor(private readonly faceRecognitionApiService: FaceRecognitionApiService) {}

    public async getUserProfiles(
        fullName: string | undefined,
        legalIdName: string | undefined,
        legalIdValue: string | undefined,
        page: number,
        pageSize: number,
        sortColumn: 'full-name' | 'created-on' | 'last-modified-on' | undefined,
        sortOrder: 'ascending' | 'descending' | undefined,
    ): Promise<UserProfileDtoOutput[]> {
        const userList = await this.faceRecognitionApiService.getUserProfiles(
            fullName,
            legalIdName,
            legalIdValue,
            page,
            pageSize,
            sortColumn,
            sortOrder,
        );

        return userList.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            dobInISOString: user.dobInISOString,
            legalIds: [Object.assign({}, ...user.legalIds)],
            metadata: user.metadata,
            createdDateInISOString: user.createdDateInISOString,
            lastModifiedDateInISOString: user.lastModifiedDateInISOString,
        }));
    }
}
