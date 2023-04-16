import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { S3StorageService } from '../s3-storage/s3-storage.service';
import { UserProfileDtoOutput } from './dtos';
import { FaceRecognitionData } from './models';

@Injectable({
    providedIn: 'root',
})
export class FaceRecognitionApiService {
    constructor(
        private readonly s3StorageService: S3StorageService,
        private readonly httpClient: HttpClient,
        private readonly localStorageService: LocalStorageService,
    ) {}

    public async createUserProfile(
        fullName: string,
        dob: Date,
        legalIds: Record<string, string>[],
        metadata: Record<string, string>[],
    ): Promise<{ userProfileId: string }> {
        return await firstValueFrom(
            this.httpClient.post<{ userProfileId: string }>(environment.api.faceRecognition.userProfile, {
                fullName: fullName,
                dobInISOString: dob.toISOString(),
                legalIds: legalIds,
                metadata: metadata,
            }),
        );
    }

    public async updateUserProfile(
        userProfileId: string,
        fullName: string,
        dob: Date,
        legalIds: Record<string, string>[],
    ): Promise<void> {
        await firstValueFrom(
            this.httpClient.put(`${environment.api.faceRecognition.userProfile}/${userProfileId}`, {
                fullName: fullName,
                dobInISOString: dob.toISOString(),
                legalIds: legalIds,
            }),
        );
    }

    public async deleteUserProfile(userProfileId: string): Promise<void> {
        await firstValueFrom(this.httpClient.delete(`${environment.api.faceRecognition.userProfile}/${userProfileId}`));
    }

    public async getUserProfiles(
        fullName: string | undefined,
        legalIdName: string | undefined,
        legalIdValue: string | undefined,
        page: number,
        pageSize: number,
        sortColumn: 'full-name' | 'created-on' | 'last-modified-on' | undefined,
        sortOrder: 'ascending' | 'descending' | undefined,
    ): Promise<UserProfileDtoOutput[]> {
        let params = new HttpParams();

        if (fullName) params = params.append('fullName', fullName);
        if (legalIdName) params = params.append('legalIdName', legalIdName);
        if (legalIdValue) params = params.append('legalIdValue', legalIdValue);
        if (sortColumn) params = params.append('sortColumn', sortColumn);
        if (sortOrder) params = params.append('sortOrder', sortOrder);

        params = params.append('page', page);
        params = params.append('pageSize', pageSize);

        return await firstValueFrom(
            this.httpClient.get<UserProfileDtoOutput[]>(environment.api.faceRecognition.userProfile, {
                params: params,
            }),
        );
    }

    public async getUserProfileByUserProfileId(userProfileId: string): Promise<UserProfileDtoOutput> {
        return await firstValueFrom(
            this.httpClient.get<UserProfileDtoOutput>(
                `${environment.api.faceRecognition.userProfile}/${userProfileId}`,
            ),
        );
    }

    public async submitUserRecognitionData(userProfileId: string, recognitionData: unknown[]): Promise<void> {
        await firstValueFrom(
            this.httpClient.post(environment.api.faceRecognition.userRecognition.submitRecognitionData, {
                userProfileId: userProfileId,
                recognitionData: recognitionData,
            }),
        );
    }

    public async getRecognitionDataStatus(userProfileId: string): Promise<{
        doesHaveUserRecognitionData: boolean;
    }> {
        return await firstValueFrom(
            this.httpClient.get<{
                doesHaveUserRecognitionData: boolean;
            }>(
                `${environment.api.faceRecognition.userRecognition.getRecognitionDataStatus}?userProfileId=${userProfileId}`,
            ),
        );
    }

    public async getRecognitionDataList(userTag: string): Promise<FaceRecognitionData[]> {
        const objectsOverview = await this.s3StorageService.getObjectsOverviewInFolder(userTag);

        const faceRecognitionData: FaceRecognitionData[] = [];

        for (const objectOverview of objectsOverview) {
            const cache = await this.localStorageService.get<{
                faceRecognitionData: FaceRecognitionData;
                lastModifiedOn: string;
            }>(objectOverview.objectKey);

            if (!!cache && cache.lastModifiedOn.toString() === objectOverview.lastModifiedOn?.toString()) {
                faceRecognitionData.push(cache.faceRecognitionData);
                console.log(`Returning object ${objectOverview.objectKey} from cache`);
                continue;
            }

            const content = await this.s3StorageService.getObjectContent(objectOverview.objectKey);

            if (!content) {
                console.warn(`Failed to read object: ${objectOverview.objectKey}`);
                continue;
            }

            if (objectOverview.lastModifiedOn) {
                console.log(`Caching ${objectOverview.objectKey}`);

                await this.localStorageService.set<{
                    faceRecognitionData: FaceRecognitionData;
                    lastModifiedOn: string;
                }>(objectOverview.objectKey, {
                    faceRecognitionData: JSON.parse(content),
                    lastModifiedOn: objectOverview.lastModifiedOn.toString(),
                });
            }

            faceRecognitionData.push(JSON.parse(content));
        }

        return faceRecognitionData;
    }

    public emptyFaceRecognitionDataCache(): Promise<void> {
        return this.localStorageService.empty();
    }
}
