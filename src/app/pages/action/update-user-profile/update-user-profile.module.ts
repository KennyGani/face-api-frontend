import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ConfirmationDialogModule } from '../../../components/dialog/confirmation-dialog/confirmation-dialog.module';
import { UpdateUserProfileComponent } from './update-user-profile.component';

@NgModule({
    declarations: [UpdateUserProfileComponent],
    exports: [UpdateUserProfileComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        MatButtonModule,
        ReactiveFormsModule,
        ConfirmationDialogModule,
    ],
})
export class UpdateUserProfileModule {}
