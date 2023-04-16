import { Injectable } from '@angular/core';

import { UserProfileDtoOutput } from '../../../shared/face-recognition-api/dtos';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private readonly faceRecognitionApiService: FaceRecognitionApiService) {}

    public async getUserProfileByUserProfileId(userProfileId: string): Promise<UserProfileDtoOutput> {
        const user = await this.faceRecognitionApiService.getUserProfileByUserProfileId(userProfileId);

        let createdDateInISOString, lastModifiedDateInISOString;

        const legalIds = user.legalIds;
        const mergedLegalIds = [Object.assign({}, ...legalIds)];

        const legalIdTypeEnum = Object.values(LegalIdTypeEnum);

        legalIdTypeEnum.forEach((legalIdTypeEnum) => {
            if (!mergedLegalIds[0][legalIdTypeEnum]) {
                mergedLegalIds[0][legalIdTypeEnum] = '-';
            }
        });

        if (!user.createdDateInISOString) {
            createdDateInISOString = '-';
        } else {
            createdDateInISOString = user.createdDateInISOString;
        }

        if (!user.lastModifiedDateInISOString) {
            lastModifiedDateInISOString = '-';
        } else {
            lastModifiedDateInISOString = user.lastModifiedDateInISOString;
        }

        return {
            id: user.id,
            fullName: user.fullName,
            dobInISOString: user.dobInISOString,
            legalIds: mergedLegalIds,
            metadata: user.metadata,
            createdDateInISOString: createdDateInISOString,
            lastModifiedDateInISOString: lastModifiedDateInISOString,
        };
    }

    public async hasRecognitionData(userProfileId: string): Promise<boolean> {
        const userFaceRecognitionStatus = await this.faceRecognitionApiService.getRecognitionDataStatus(userProfileId);

        return userFaceRecognitionStatus.doesHaveUserRecognitionData;
    }
}
