import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FaceRecognitionComponent } from './face-recognition.component';

@NgModule({
    declarations: [FaceRecognitionComponent],
    imports: [CommonModule],
    exports: [FaceRecognitionComponent],
})
export class FaceRecognitionModule {}
