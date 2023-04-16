import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { USER_CREATION_PAGE, USER_FACE_UPDATE_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';
import { AuthenticationService } from '../../authentication/authentication.service';
import { USER_METADATA_TAG } from '../../authentication/consts';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent {
    protected fullName = '';
    protected dob = '';
    protected ktpId = '';
    protected bpjsId = '';
    protected dobFormControl = new FormControl('', [Validators.required]);
    protected ktpIdFormControl = new FormControl('', [Validators.required, Validators.pattern('^([a-zA-Z0-9]*)$')]);
    protected bpjsIdFormControl = new FormControl('', [Validators.required, Validators.pattern('^([a-zA-Z0-9]*)$')]);
    protected fullNameFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern('^([A-Za-z]|([A-Za-z][A-Za-z ]{0,100}[A-Za-z]))$'),
    ]);

    private hasFormSubmitted = false;

    constructor(
        private readonly faceRecognitionApiService: FaceRecognitionApiService,
        private readonly router: Router,
        private readonly authenticationService: AuthenticationService,
        private readonly dialog: MatDialog,
    ) {}

    protected canSubmitForm(): boolean {
        if (this.hasFormSubmitted) {
            return false;
        }

        if (!this.fullNameFormControl.valid) {
            return false;
        }

        if (!this.dobFormControl.valid) {
            return false;
        }

        if (!this.bpjsIdFormControl.valid && !this.ktpIdFormControl.valid) {
            return false;
        }

        // Bpjs id is valid, ktp id is not valid (can be empty or has invalid format) and not empty
        if (this.bpjsIdFormControl.valid && !this.ktpIdFormControl.valid && !!this.ktpId.trim()) {
            return false;
        }

        // Ktp id is bpjs id is not valid (can be empty or has invalid format) and not empty
        if (this.ktpIdFormControl.valid && !this.bpjsIdFormControl.valid && !!this.bpjsId.trim()) {
            return false;
        }

        return true;
    }

    protected async onSubmit(): Promise<void> {
        this.hasFormSubmitted = true;

        try {
            const userMetadata = (await this.authenticationService.getAuthenticatedUser())?.user_metadata;

            if (!userMetadata) {
                throw new Error('user metadata does not exist');
            }

            if (!userMetadata[USER_METADATA_TAG]) {
                throw new Error('user metadata tag does not exist');
            }

            const legalIds: Record<string, string>[] = [];

            if (this.ktpId.trim()) {
                legalIds.push({
                    [LegalIdTypeEnum.KtpId]: this.ktpId.trim().toLowerCase(),
                });
            }

            if (this.bpjsId.trim()) {
                legalIds.push({
                    [LegalIdTypeEnum.BpjsId]: this.bpjsId.trim().toLowerCase(),
                });
            }

            const newUser = await this.faceRecognitionApiService.createUserProfile(
                this.fullName.trim().toLowerCase(),
                new Date(this.dob),
                legalIds,
                [userMetadata],
            );

            this.dialog
                .open(ConfirmationDialogComponent, {
                    hasBackdrop: true,
                    data: {
                        title: 'Registrasi',
                        message: 'Data berhasil ditambahkan.',
                        confirmationMessage: 'Lanjutkan',
                    },
                })
                .afterClosed()
                .subscribe(() => {
                    this.router.navigateByUrl(USER_FACE_UPDATE_PAGE + '?userId=' + newUser.userProfileId);
                });
        } catch (error) {
            this.showErrorModal();
            console.log(error);
            return;
        }
    }

    private showErrorModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Error',
                    message: 'Gagal menambahkan data. Coba lagi.',
                    confirmationMessage: 'Kembali',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.hasFormSubmitted = false;
            });
    }
}
