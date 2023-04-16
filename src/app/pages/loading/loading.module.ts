import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoadingComponent } from './loading.component';

@NgModule({
    declarations: [LoadingComponent],
    imports: [CommonModule, NgxSpinnerModule],
    exports: [LoadingComponent],
})
export class LoadingModule {}
