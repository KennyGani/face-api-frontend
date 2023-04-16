import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { ConfirmationDialogModule } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.module';
import { FaceRecognitionModule } from '../../face-recognition/face-recognition.module';
import { CheckInUserIdentityConfirmationComponent } from './check-in-user-identity-confirmation/check-in-user-identity-confirmation.component';
import { CheckInUserPoliclinicSelectionComponent } from './check-in-user-policlinic-selection/check-in-user-policlinic-selection.component';
import { CheckInUserQueueNumberComponent } from './check-in-user-queue-number/check-in-user-queue-number.component';
import { CheckInUserComponent } from './check-in-user.component';

@NgModule({
    declarations: [
        CheckInUserComponent,
        CheckInUserPoliclinicSelectionComponent,
        CheckInUserIdentityConfirmationComponent,
        CheckInUserQueueNumberComponent,
    ],
    exports: [CheckInUserComponent],
    imports: [
        CommonModule,
        FaceRecognitionModule,
        MatButtonModule,
        ConfirmationDialogModule,
        MatRadioModule,
        FormsModule,
        MatDialogModule,
    ],
})
export class CheckInUserModule {}
