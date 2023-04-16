import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import { environment } from '../../../environments/environment';
import { S3ObjectOverview } from './models';

@Injectable({
    providedIn: 'root',
})
export class S3StorageService {
    public async getObjectsOverviewInFolder(folderName: string): Promise<S3ObjectOverview[]> {
        const s3 = new AWS.S3({
            accessKeyId: environment.s3.accessKey,
            secretAccessKey: environment.s3.accessSecret,
            region: environment.s3.region,
        });

        const result = await s3
            .listObjectsV2({
                Bucket: environment.s3.bucketName,
                Prefix: `${folderName}/`,
            })
            .promise();

        if (!result.$response.data?.Contents) {
            console.log('S3 response data / contents is empty');
            return [];
        }

        const s3ObjectsOverview: S3ObjectOverview[] = [];

        for (const objectListContent of result.$response.data.Contents) {
            if (objectListContent.Key) {
                s3ObjectsOverview.push({
                    objectKey: objectListContent.Key,
                    lastModifiedOn: objectListContent.LastModified,
                    size: objectListContent.Size ?? 0,
                });
            }
        }

        return s3ObjectsOverview;
    }

    public async getObjectContent(objectKey: string): Promise<string | undefined> {
        const s3 = new AWS.S3({
            accessKeyId: environment.s3.accessKey,
            secretAccessKey: environment.s3.accessSecret,
            region: environment.s3.region,
        });

        const object = await s3.getObject({ Bucket: environment.s3.bucketName, Key: objectKey }).promise();

        if (!object.Body) {
            return undefined;
        }

        return object.Body.toString('utf-8');
    }
}
