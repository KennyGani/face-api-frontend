import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from '../../app-routing.module';
import { MaterialModule } from '../../shared/angular-material/material.module';
import { UserListModule } from './user-list/user-list.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserComponent } from './user.component';

@NgModule({
    declarations: [UserComponent],
    imports: [CommonModule, MaterialModule, UserProfileModule, UserListModule, AppRoutingModule],
    exports: [UserComponent],
})
export class UserModule {}
