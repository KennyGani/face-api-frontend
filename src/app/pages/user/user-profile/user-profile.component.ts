import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { USER_FACE_UPDATE_PAGE, USER_PAGE, USER_UPDATE_PAGE } from '../../../app-routing.module';
import { ConfirmationDialogComponent } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.component';
import { LegalIdTypeEnum } from '../../../shared/legal-id-type';
import { DateUtility } from '../../../utilities';
import { DeleteUserConfirmationComponent } from '../../action/delete-user-confirmation/delete-user-confirmation.component';
import { UserProfile } from './models';
import { UserService } from './user-profile.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
    protected userProfile?: UserProfile;

    private userId?: string;

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly userService: UserService,
        private readonly dateUtility: DateUtility,
        private readonly dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        this.userId = this.route.snapshot.params['id'];

        if (!this.userId) {
            this.showErrorModal();
        } else {
            try {
                await this.getUserProfileById(this.userId);
            } catch (error) {
                this.showErrorModal();
                console.log(error);
                return;
            }
        }
    }

    protected editUserProfile(): void {
        this.router.navigate([USER_UPDATE_PAGE], {
            queryParams: {
                userId: this.userId,
                fullName: this.userProfile?.fullName,
                dob: this.userProfile?.dobInString,
                ktpId: this.userProfile?.ktpId?.replace('-', ''),
                bpjsId: this.userProfile?.bpjsId?.replace('-', ''),
            },
        });
    }

    protected updateUserFaceModel(): void {
        this.router.navigateByUrl(USER_FACE_UPDATE_PAGE + '?userId=' + this.userId);
    }

    protected deleteUser(): void {
        this.dialog.open(DeleteUserConfirmationComponent, {
            hasBackdrop: true,
            data: {
                userId: this.userId,
            },
        });
    }

    private async getUserProfileById(userId: string): Promise<void> {
        const user = await this.userService.getUserProfileByUserProfileId(userId);
        const hasRecognitionData = await this.userService.hasRecognitionData(userId);

        this.userProfile = {
            id: user.id,
            fullName: user.fullName,
            dobInString: this.dateUtility.convertDateToDDMMYYYYString(user.dobInISOString),
            createdDateInString: this.dateUtility.convertDateToDDMMYYYYString(user.createdDateInISOString),
            lastModifiedDateInString: this.dateUtility.convertDateToDDMMYYYYString(user.lastModifiedDateInISOString),
            ktpId: user.legalIds[0][LegalIdTypeEnum.KtpId],
            bpjsId: user.legalIds[0][LegalIdTypeEnum.BpjsId],
            hasRecognitionData: hasRecognitionData,
        };
    }

    private showErrorModal(): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                hasBackdrop: true,
                data: {
                    title: 'Error',
                    message: 'Coba lagi.',
                    confirmationMessage: 'Kembali',
                },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigateByUrl(USER_PAGE);
            });
    }
}
