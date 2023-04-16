import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FaceMatch, LabeledFaceDescriptors } from 'face-api.js';
import { delay, firstValueFrom, fromEvent, Observable, of, Subject, take } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FaceRecognitionService } from './face-recognition.service';

@Component({
    selector: 'app-face-recognition',
    templateUrl: './face-recognition.component.html',
    styleUrls: ['./face-recognition.component.scss'],
})
export class FaceRecognitionComponent implements OnInit, OnDestroy {
    private static readonly FACE_RECOGNITION_ANALYSIS_PICTURE_RETRIEVAL_DELAY_IN_MS = 21;

    @ViewChild('cameraVideo', { static: true })
    private cameraVideo!: ElementRef<HTMLVideoElement>;

    @ViewChild('faceDetectionCanvas', { static: true })
    private faceDetectionCanvas!: ElementRef<HTMLCanvasElement>;

    private canLoadRecognitionDataAndStartRecognition = false;

    private faceRecognitionDataGroups: LabeledFaceDescriptors[][] = [];

    private faceRecognitionAnalysisProgressPercentageSubject = new Subject<number>();

    public get faceRecognitionAnalysisProgressPercentageObservable() {
        return this.faceRecognitionAnalysisProgressPercentageSubject.asObservable();
    }

    constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

    async ngOnInit(): Promise<void> {
        if (!this.cameraVideo) {
            throw new Error('Camera video does not exist');
        }

        if (!this.faceDetectionCanvas) {
            throw new Error('Face detection canvas does not exist');
        }

        await this.openAndPlayCameraVideo();

        while (
            !this.faceDetectionCanvas.nativeElement.clientWidth ||
            !this.faceDetectionCanvas.nativeElement.clientHeight ||
            !this.cameraVideo.nativeElement.clientWidth ||
            !this.cameraVideo.nativeElement.clientHeight
        ) {
            await firstValueFrom(of(true).pipe(delay(1000)));
        }

        // Adjust canvas to overlay the video camera
        this.faceDetectionCanvas.nativeElement.style.top = `${this.cameraVideo.nativeElement.offsetTop}px`;
        this.faceDetectionCanvas.nativeElement.style.left = `${this.cameraVideo.nativeElement.offsetLeft}px`;
        this.faceDetectionCanvas.nativeElement.style.width = `${this.cameraVideo.nativeElement.clientWidth}px`;
        this.faceDetectionCanvas.nativeElement.style.height = `${this.cameraVideo.nativeElement.clientHeight}px`;

        await this.faceRecognitionService.configureAndLoadFaceDetectionInput(this.faceDetectionCanvas.nativeElement);

        this.canLoadRecognitionDataAndStartRecognition = true;
    }

    ngOnDestroy(): void {
        this.stopCamera();
    }

    public async loadFaceRecognitionData(faceRecognitionDataTag: string): Promise<void> {
        this.faceRecognitionDataGroups = await this.faceRecognitionService.generateFaceRecognitionDataGroups(
            faceRecognitionDataTag,
            environment.appConfig.faceRecognition.numberOfDataLoadPerGroup,
        );
    }

    public async getFirstDetectionId(
        excludedDetectionId: string[],
        cancellationObservable: Observable<void>,
    ): Promise<string | undefined> {
        let mustStopRecognition = false;

        cancellationObservable.subscribe(() => {
            mustStopRecognition = true;
        });

        while (!this.canLoadRecognitionDataAndStartRecognition) {
            console.log('waiting to load and start recognition process.');
            await firstValueFrom(of(true).pipe(delay(1000)));
        }

        console.log('loading face recognition data and starting recognition.');

        if (this.faceRecognitionDataGroups.length <= 0) {
            console.log('Skipping face recognition since face recognition data list is empty');
            return;
        }

        let detectedFace: FaceMatch | undefined;

        let faceRecognitionConfidencePercentage = environment.appConfig.faceRecognition.startingConfidencePercentage;

        do {
            detectedFace = await this.faceRecognitionService.detect(
                this.cameraVideo.nativeElement,
                this.faceDetectionCanvas.nativeElement,
                this.faceRecognitionDataGroups,
                excludedDetectionId,
                faceRecognitionConfidencePercentage,
            );

            if (
                faceRecognitionConfidencePercentage > environment.appConfig.faceRecognition.minimumConfidencePercentage
            ) {
                faceRecognitionConfidencePercentage -= 0.1;
            }
        } while (!detectedFace && !mustStopRecognition);

        return detectedFace?.label;
    }

    public async startAnalyseAndGetRecognitionData(
        numberOfPicturesToAnalyse: number,
        cancellationObservable: Observable<void>,
    ): Promise<number[][]> {
        let mustStopAnalysis = false;

        cancellationObservable.subscribe(() => {
            mustStopAnalysis = true;
        });

        while (!this.canLoadRecognitionDataAndStartRecognition) {
            console.log('waiting to load and start recognition process for analysis.');
            await firstValueFrom(of(true).pipe(delay(1000)));
        }

        this.faceRecognitionAnalysisProgressPercentageSubject.next(0);

        const faceDescriptors: number[][] = [];

        while (faceDescriptors.length < numberOfPicturesToAnalyse && !mustStopAnalysis) {
            this.faceDetectionCanvas.nativeElement
                .getContext('2d')
                ?.drawImage(
                    this.cameraVideo.nativeElement,
                    0,
                    0,
                    this.faceDetectionCanvas.nativeElement.width,
                    this.faceDetectionCanvas.nativeElement.height,
                );

            const faceDescriptor = await this.faceRecognitionService.generateFaceDescriptor(
                this.faceDetectionCanvas.nativeElement.toDataURL('image/png'),
            );

            if (!faceDescriptor) {
                continue;
            }

            faceDescriptors.push(faceDescriptor);
            this.faceRecognitionAnalysisProgressPercentageSubject.next(
                (faceDescriptors.length * 100) / numberOfPicturesToAnalyse,
            );

            await firstValueFrom(
                of(true).pipe(delay(FaceRecognitionComponent.FACE_RECOGNITION_ANALYSIS_PICTURE_RETRIEVAL_DELAY_IN_MS)),
            );
        }

        // Clean up canvas
        this.clearFaceBoxDetection();

        return faceDescriptors;
    }

    private stopCamera(): void {
        if (!this.cameraVideo) {
            return;
        }

        if (!(this.cameraVideo.nativeElement.srcObject instanceof MediaStream)) {
            return;
        }

        const tracks = this.cameraVideo.nativeElement.srcObject.getTracks();

        if (tracks.length <= 0) {
            return;
        }

        tracks.forEach((track) => {
            track.stop();
        });

        this.cameraVideo.nativeElement.srcObject = null;
    }

    public clearFaceBoxDetection(): void {
        try {
            this.faceDetectionCanvas.nativeElement
                .getContext('2d', { willReadFrequently: true })
                ?.clearRect(
                    0,
                    0,
                    this.faceDetectionCanvas.nativeElement.width,
                    this.faceDetectionCanvas.nativeElement.height,
                );
        } catch (error) {
            console.log(`Failed to clear face box detection. Error: ${JSON.stringify(error)}`);
        }
    }

    private async openAndPlayCameraVideo(): Promise<void> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Media devices navigator or get user media does not exist');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: this.cameraVideo.nativeElement.clientWidth,
                height: this.cameraVideo.nativeElement.clientHeight * 1.1,
            },
        });

        this.cameraVideo.nativeElement.srcObject = mediaStream;

        // Wait until loadedmetadata is fired (first time)
        await firstValueFrom(fromEvent(this.cameraVideo.nativeElement, 'loadedmetadata').pipe(take(1)));
        await this.cameraVideo.nativeElement.play();
    }
}
