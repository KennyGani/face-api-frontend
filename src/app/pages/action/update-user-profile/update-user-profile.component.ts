import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { USER_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { FaceRecognitionApiService } from '../../../shared/face-recognition-api/face-recognition-api.service';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';
import { DateUtility } from '../../../utilities';
import { AuthenticationService } from '../../authentication/authentication.service';
import { USER_METADATA_TAG } from '../../authentication/consts';

@Component({
    selector: 'app-user-update',
    templateUrl: './update-user-profile.component.html',
    styleUrls: ['./update-user-profile.component.scss'],
})
export class UpdateUserProfileComponent implements OnInit {
    protected userId = '';

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
        private readonly authenticationService: AuthenticationService,
        private readonly dateUtility: DateUtility,
        private readonly dialog: MatDialog,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.setFormWithExistingData();
    }

    protected setFormWithExistingData(): void {
        this.route.queryParams.subscribe((params) => {
            this.userId = params['userId'];
            this.fullName = params['fullName'];
            this.dob = this.dateUtility.convertDateToDDMMYYYYString(params['dob']);
            this.ktpId = params['ktpId'];
            this.bpjsId = params['bpjsId'];
        });
    }

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

            await this.faceRecognitionApiService.updateUserProfile(
                this.userId,
                this.fullName.trim().toLowerCase(),
                new Date(this.dob),
                legalIds,
            );

            this.showSuccessModal();
        } catch (error) {
            this.showErrorModal();
            console.log(error);
            return;
        }
    }

    private showSuccessModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Berhasil',
                    message: 'Data berhasil diubah.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigateByUrl(USER_PAGE + '/' + this.userId);
            });
    }

    private showErrorModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Error',
                    message: 'Gagal merubah data. Coba lagi.',
                    confirmationMessage: 'Ok',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigateByUrl(USER_PAGE + '/' + this.userId);
            });
    }
}
