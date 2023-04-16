import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { MaterialModule } from '../../../shared/angular-material/material.module';
import { FaceRecognitionModule } from '../../face-recognition/face-recognition.module';
import { UpdateUserFaceModelComponent } from './update-user-face-model.component';

@NgModule({
    declarations: [UpdateUserFaceModelComponent],
    exports: [UpdateUserFaceModelComponent],
    imports: [
        CommonModule,
        MaterialModule,
        FaceRecognitionModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
    ],
})
export class UpdateUserFaceModelModule {}
