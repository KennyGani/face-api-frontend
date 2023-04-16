import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from '../../../app-routing.module';
import { MaterialModule } from '../../../shared/angular-material/material.module';
import { DeleteUserConfirmationComponent } from '../../action/delete-user-confirmation/delete-user-confirmation.component';
import { UserProfileComponent } from './user-profile.component';

@NgModule({
    declarations: [UserProfileComponent, DeleteUserConfirmationComponent],
    exports: [UserProfileComponent],
    imports: [CommonModule, MaterialModule, AppRoutingModule, MatDialogModule],
})
export class UserProfileModule {}
