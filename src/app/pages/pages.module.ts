import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ActionModule } from './action/action.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { HomeModule } from './home/home.module';
import { LoadingComponent } from './loading/loading.component';
import { LoadingModule } from './loading/loading.module';
import { UserModule } from './user/user.module';

@NgModule({
    imports: [CommonModule, HomeModule, LoadingModule, AuthenticationModule, UserModule, ActionModule],
    exports: [LoadingComponent],
})
export class PagesModule {}
