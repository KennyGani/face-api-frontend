import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';

import { USER_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';
import { FaceRecognitionComponent } from '../../face-recognition/face-recognition.component';

@Component({
    selector: 'app-update-user-face-model',
    templateUrl: './update-user-face-model.component.html',
    styleUrls: ['./update-user-face-model.component.scss'],
})
export class UpdateUserFaceModelComponent implements OnInit, OnDestroy {
    @ViewChild('faceRecognition', { static: true })
    private faceRecognition!: FaceRecognitionComponent;

    private userId!: string;
    private faceAnalysisCancellationSubject = new Subject<void>();

    protected accuracyOptions = [
        {
            name: 'Cepat',
            numberOfPictureTaken: 100,
        },
        {
            name: 'Normal',
            numberOfPictureTaken: 200,
        },
        {
            name: 'Lebih Akurat',
            numberOfPictureTaken: 250,
        },
        {
            name: 'Sangat Akurat',
            numberOfPictureTaken: 300,
        },
    ];
    protected selectedNumberOfPictureTaken = this.accuracyOptions[1].numberOfPictureTaken;
    protected faceRecognitionAnalysisProgressPercentage = 0;
    protected navigateToUserSearchPage = () => this.router.navigateByUrl(USER_PAGE);
    protected hasStartedFaceAnalysis = false;

    constructor(
        private readonly faceApiRecognitionService: FaceRecognitionApiService,
        private readonly activeRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        const userId = <string | undefined>(await firstValueFrom(this.activeRoute.queryParams))['userId'];

        if (!userId?.trim()) {
            this.router.navigateByUrl(USER_PAGE);
            return;
        }

        this.userId = userId;
    }

    ngOnDestroy(): void {
        this.faceAnalysisCancellationSubject.next();
    }

    protected async startFaceAnalysis(): Promise<void> {
        this.hasStartedFaceAnalysis = true;

        let mustStopFaceAnalysis = false;

        this.faceAnalysisCancellationSubject.subscribe(() => {
            mustStopFaceAnalysis = true;
        });

        try {
            const subscription = this.faceRecognition.faceRecognitionAnalysisProgressPercentageObservable.subscribe(
                (progressPercentage) => {
                    this.faceRecognitionAnalysisProgressPercentage = progressPercentage;

                    if (this.faceRecognitionAnalysisProgressPercentage >= 100) {
                        subscription.unsubscribe();
                    }
                },
            );

            const recognitionData = await this.faceRecognition.startAnalyseAndGetRecognitionData(
                this.selectedNumberOfPictureTaken,
                this.faceAnalysisCancellationSubject.asObservable(),
            );

            if (mustStopFaceAnalysis) {
                return;
            }

            await this.faceApiRecognitionService.submitUserRecognitionData(this.userId, recognitionData);

            this.showSuccessModal();
        } catch (error) {
            this.showErrorModal();
            console.log(error);
        }
    }

    private showSuccessModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Berhasil',
                    message: 'Data wajah berhasil ditambah/ubah.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.navigateToUserSearchPage();
            });
    }

    private showErrorModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Error',
                    message: 'Gagal menambahkan/merubah data wajah. Coba lagi.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.hasStartedFaceAnalysis = false;
            });
    }
}
