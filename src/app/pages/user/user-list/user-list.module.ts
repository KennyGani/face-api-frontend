import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../../shared/angular-material/material.module';
import { UserListComponent } from './user-list.component';

@NgModule({
    declarations: [UserListComponent],
    imports: [CommonModule, MaterialModule, FormsModule],
    exports: [UserListComponent],
})
export class UserListModule {}
