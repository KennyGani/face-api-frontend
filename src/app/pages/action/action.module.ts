import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from '../../app-routing.module';
import { ActionComponent } from './action.component';
import { CheckInUserModule } from './check-in-user/check-in-user.module';
import { CreateUserModule } from './create-user/create-user.module';
import { UpdateUserFaceModelModule } from './update-user-face-model/update-user-face-mode.module';
import { UpdateUserProfileModule } from './update-user-profile/update-user-profile.module';

@NgModule({
    declarations: [ActionComponent],
    imports: [
        CommonModule,
        CreateUserModule,
        UpdateUserFaceModelModule,
        UpdateUserProfileModule,
        CheckInUserModule,
        AppRoutingModule,
    ],
    exports: [ActionComponent],
})
export class ActionModule {}
