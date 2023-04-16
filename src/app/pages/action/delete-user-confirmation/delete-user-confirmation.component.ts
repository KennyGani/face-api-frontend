import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { USER_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';

@Component({
    selector: 'app-delete-user-confirmation',
    templateUrl: './delete-user-confirmation.component.html',
    styleUrls: ['./delete-user-confirmation.component.scss'],
})
export class DeleteUserConfirmationComponent implements OnInit {
    private static readonly DEFAULT_DIALOG_WIDTH = '55vw';
    private static readonly DEFAULT_DIALOG_HEIGHT = '55vh';

    constructor(
        @Inject(MAT_DIALOG_DATA)
        protected data: {
            userId: string;
        },
        private readonly dialogRef: MatDialogRef<DeleteUserConfirmationComponent>,
        private readonly faceRecognitionApiService: FaceRecognitionApiService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.dialogRef.updateSize(
            DeleteUserConfirmationComponent.DEFAULT_DIALOG_WIDTH,
            DeleteUserConfirmationComponent.DEFAULT_DIALOG_HEIGHT,
        );
        this.dialogRef.disableClose = true;
    }

    protected async deleteUser(): Promise<void> {
        try {
            await this.faceRecognitionApiService.deleteUserProfile(this.data.userId);
            this.dialogRef.close();
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
                    message: 'Data pasien telah terhapus.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigateByUrl(USER_PAGE);
            });
    }

    private showErrorModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Error',
                    message: 'Gagal menghapus data. Coba lagi.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigateByUrl(USER_PAGE);
            });
    }
}
