import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';

import { UserProfileDtoOutput } from '../../../shared/face-recognition-api/dtos';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';
import { AsamedikaDoctortoolService } from '../../../shared/integrations/asamedika-doctortool.service';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';
import { AuthenticationService } from '../../authentication/authentication.service';
import { USER_METADATA_TAG } from '../../authentication/consts';
import { FaceRecognitionComponent } from '../../face-recognition/face-recognition.component';
import { CheckInUserIdentityConfirmationComponent } from './check-in-user-identity-confirmation/check-in-user-identity-confirmation.component';
import { CheckInUserPoliclinicSelectionComponent } from './check-in-user-policlinic-selection/check-in-user-policlinic-selection.component';
import { CheckInUserQueueNumberComponent } from './check-in-user-queue-number/check-in-user-queue-number.component';

@Component({
    selector: 'app-check-in-user',
    templateUrl: './check-in-user.component.html',
    styleUrls: ['./check-in-user.component.scss'],
})
export class CheckInUserComponent implements OnInit, OnDestroy {
    @ViewChild('faceRecognition', { static: true })
    private faceRecognition!: FaceRecognitionComponent;
    private excludedPatientIdsForRecognition: string[] = [];
    private faceRecognitionCancellationSubject = new Subject<void>();

    protected hasStartedRecognition = false;

    constructor(
        protected readonly faceRecognitionApiService: FaceRecognitionApiService,
        private readonly authenticationService: AuthenticationService,
        private readonly asamedikaDoctortoolService: AsamedikaDoctortoolService,
        private readonly dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        const user = await this.authenticationService.getAuthenticatedUser();

        if (!user?.user_metadata[USER_METADATA_TAG]) {
            throw new Error('user metadata tag does not exist');
        }

        await this.faceRecognition.loadFaceRecognitionData(user.user_metadata[USER_METADATA_TAG]);
    }

    ngOnDestroy(): void {
        this.faceRecognitionCancellationSubject.next();
    }

    protected async startFaceRecognition(): Promise<void> {
        this.hasStartedRecognition = true;

        let mustStopFaceRecognition = false;

        this.faceRecognitionCancellationSubject.subscribe(() => {
            mustStopFaceRecognition = true;
        });

        let detectedPatient = undefined;

        try {
            const detectedPatientId = await this.faceRecognition.getFirstDetectionId(
                this.excludedPatientIdsForRecognition,
                this.faceRecognitionCancellationSubject.asObservable(),
            );

            if (!detectedPatientId || mustStopFaceRecognition) {
                this.startOver();
                return;
            }

            detectedPatient = await this.faceRecognitionApiService.getUserProfileByUserProfileId(detectedPatientId);

            if (!detectedPatient) {
                throw new Error(`Failed to get user profile for userId ${detectedPatientId}`);
            }
        } catch (error) {
            await this.startOverAndShowDialog('Error', 'Gagal menemukan data pasien. Hubungi customer service.', 'Ok');
            console.log(error);

            return;
        }

        const isIdentityConfirmed = await this.promptIdentityConfirmationAndWaitResponse(detectedPatient);

        if (this.hasEmptyResponse(isIdentityConfirmed)) {
            this.startOver();
            return;
        }

        if (!isIdentityConfirmed) {
            this.excludedPatientIdsForRecognition.push(detectedPatient.id);
            await this.startFaceRecognition();
            return;
        }

        let selectedPoliclinicId = undefined;

        try {
            selectedPoliclinicId = await this.promptPoliclinicSelectionAndWaitResponse();
        } catch (error) {
            await this.startOverAndShowDialog(
                'Error',
                'Gagal menemukan layanan hari ini. Hubungi customer service.',
                'Ok',
            );
            console.log(error);

            return;
        }

        if (this.hasEmptyResponse(selectedPoliclinicId)) {
            this.startOver();
            return;
        }

        try {
            const patientLegalIdsRecord = Object.values(detectedPatient.legalIds)[0];

            await this.queuePatient(
                detectedPatient.fullName,
                Object.keys(patientLegalIdsRecord)[0] as LegalIdTypeEnum,
                Object.values(patientLegalIdsRecord)[0],
                <number>selectedPoliclinicId,
            );
        } catch (error) {
            await this.startOverAndShowDialog('Error', 'Antrian Gagal. Hubungi customer service.', 'Ok');
            console.log(error);

            return;
        }
    }

    protected stopFaceRecognitionAndStartOver(): void {
        this.faceRecognitionCancellationSubject.next();

        this.startOver();
    }

    private async promptIdentityConfirmationAndWaitResponse(
        detectedPatient: UserProfileDtoOutput,
    ): Promise<boolean | undefined> {
        return await firstValueFrom<boolean | undefined>(
            this.dialog
                .open(CheckInUserIdentityConfirmationComponent, {
                    hasBackdrop: true,
                    data: {
                        name: detectedPatient.fullName,
                    },
                })
                .afterClosed(),
        );
    }

    private async promptPoliclinicSelectionAndWaitResponse(): Promise<number | undefined> {
        const policlinicOptions = await this.asamedikaDoctortoolService.getPoliclinicList();

        return await firstValueFrom<number | undefined>(
            this.dialog
                .open(CheckInUserPoliclinicSelectionComponent, {
                    hasBackdrop: true,
                    data: { policlinicOptions: policlinicOptions },
                })
                .afterClosed(),
        );
    }

    private async queuePatient(
        name: string,
        legalIdType: LegalIdTypeEnum,
        legalIdValue: string,
        selectedPoliclinicId: number,
    ): Promise<void> {
        const queueId = (
            await this.asamedikaDoctortoolService.queuePatient(legalIdValue, legalIdType, selectedPoliclinicId)
        ).queueId;

        await firstValueFrom(
            this.dialog
                .open(CheckInUserQueueNumberComponent, {
                    hasBackdrop: true,
                    data: {
                        name: name,
                        queueId: queueId,
                    },
                })
                .afterClosed(),
        );
        this.startOver();
    }

    private hasEmptyResponse(response: number | string | boolean | undefined) {
        return response === undefined || !response.toString().trim();
    }

    private async startOverAndShowDialog(title: string, message: string, confirmationMessage: string): Promise<void> {
        this.startOver();
        await firstValueFrom(
            this.dialog
                .open(ConfirmationDialogComponent, {
                    hasBackdrop: true,
                    data: {
                        title: title,
                        message: message,
                        confirmationMessage: confirmationMessage,
                    },
                })
                .afterClosed(),
        );
    }

    private startOver(): void {
        this.excludedPatientIdsForRecognition = [];
        this.hasStartedRecognition = false;

        this.faceRecognition.clearFaceBoxDetection();
    }
}
