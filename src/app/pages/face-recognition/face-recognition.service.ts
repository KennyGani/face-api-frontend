import { Injectable } from '@angular/core';
import {
    Box,
    detectSingleFace,
    draw,
    FaceMatch,
    FaceMatcher,
    fetchImage,
    LabeledFaceDescriptors,
    matchDimensions,
    nets,
    resizeResults,
    SsdMobilenetv1Options,
    TNetInput,
} from 'face-api.js';
import { FaceRecognitionApiService } from '../../shared/face-recognition-api/face-recognition-api.service';

@Injectable({
    providedIn: 'root',
})
export class FaceRecognitionService {
    private static readonly FACE_API_MODELS_RELATIVE_FOLDER_PATH = '../../assets/face-api-models';
    private static readonly FACE_API_UNRECOGNISED_LABEL = 'unknown';
    private static readonly FACE_BOX_HEX_COLOR = '#000000';
    private static readonly FACE_BOX_LINE_WIDTH = 3;

    constructor(private readonly faceRecognitionApiService: FaceRecognitionApiService) {}

    public async configureAndLoadFaceDetectionInput(canvas: HTMLCanvasElement): Promise<void> {
        matchDimensions(canvas, {
            width: canvas.clientWidth,
            height: canvas.clientHeight,
        });

        await Promise.all([
            nets.ssdMobilenetv1.loadFromUri(FaceRecognitionService.FACE_API_MODELS_RELATIVE_FOLDER_PATH),
            nets.faceLandmark68Net.loadFromUri(FaceRecognitionService.FACE_API_MODELS_RELATIVE_FOLDER_PATH),
            nets.faceRecognitionNet.loadFromUri(FaceRecognitionService.FACE_API_MODELS_RELATIVE_FOLDER_PATH),
        ]);
    }

    public async generateFaceRecognitionDataGroups(
        faceRecognitionDataTag: string,
        maxFaceRecognitionDataPerGroup: number,
    ): Promise<LabeledFaceDescriptors[][]> {
        const faceRecognitionDataList = await this.faceRecognitionApiService.getRecognitionDataList(
            faceRecognitionDataTag,
        );

        if (faceRecognitionDataList.length <= 0) {
            return [];
        }

        const faceApiLabeledFaceDescriptors: LabeledFaceDescriptors[] = [];
        faceRecognitionDataList.forEach((data) => {
            faceApiLabeledFaceDescriptors.push(
                new LabeledFaceDescriptors(
                    data.label,
                    data.descriptors.map((value) => new Float32Array(value as number)),
                ),
            );
        });

        const faceRecognitionDataGroups = [];

        while (faceApiLabeledFaceDescriptors.length > 0) {
            const faceRecognitionDataForSingleGroup = faceApiLabeledFaceDescriptors.splice(
                0,
                maxFaceRecognitionDataPerGroup,
            );

            faceRecognitionDataGroups.push(faceRecognitionDataForSingleGroup);
        }

        return faceRecognitionDataGroups;
    }

    public async detect(
        cameraVideo: HTMLVideoElement,
        faceDetectionCanvas: HTMLCanvasElement,
        faceRecognitionDataGroups: LabeledFaceDescriptors[][],
        excludedFaceRecognitionLabel: string[],
        minimumFaceRecognitionConfidencePercentage: number,
    ): Promise<FaceMatch | undefined> {
        let detectedFace = await detectSingleFace(cameraVideo as TNetInput, new SsdMobilenetv1Options())
            ?.withFaceLandmarks()
            ?.withFaceDescriptor();

        if (!detectedFace || !detectedFace.detection) {
            this.clearFaceDetectionBox(faceDetectionCanvas);
            return;
        }

        detectedFace = resizeResults(detectedFace, faceDetectionCanvas);

        if (!detectedFace || !detectedFace.detection) {
            return;
        }

        this.clearFaceDetectionBox(faceDetectionCanvas);

        for (const faceRecognitionDataGroup of faceRecognitionDataGroups) {
            const filteredFaceRecognitionDataGroup = faceRecognitionDataGroup.filter(
                (data) => !excludedFaceRecognitionLabel.includes(data.label),
            );

            const bestFaceMatch = new FaceMatcher(
                filteredFaceRecognitionDataGroup,
                1 - minimumFaceRecognitionConfidencePercentage / 100,
            ).findBestMatch(detectedFace.descriptor);

            this.drawFaceDetectionBox(
                bestFaceMatch,
                detectedFace.detection.box,
                faceDetectionCanvas,
                minimumFaceRecognitionConfidencePercentage,
            );

            if (bestFaceMatch.label === FaceRecognitionService.FACE_API_UNRECOGNISED_LABEL) {
                continue;
            }

            return bestFaceMatch;
        }

        return;
    }

    public async generateFaceDescriptor(imageDataUrl: string): Promise<number[] | undefined> {
        const htmlImageElement = await fetchImage(imageDataUrl);
        const detectedFace = await detectSingleFace(htmlImageElement).withFaceLandmarks().withFaceDescriptor();

        if (!detectedFace) {
            return;
        }

        return Array.from(detectedFace.descriptor);
    }

    private clearFaceDetectionBox(faceDetectionCanvas: HTMLCanvasElement): void {
        faceDetectionCanvas
            .getContext('2d', { willReadFrequently: true })
            ?.clearRect(0, 0, faceDetectionCanvas.width, faceDetectionCanvas.height);
    }

    private drawFaceDetectionBox(
        bestFaceMatch: FaceMatch,
        detectedFaceBox: Box,
        faceDetectionCanvas: HTMLCanvasElement,
        minimumFaceRecognitionConfidencePercentage: number,
    ): void {
        const faceAccuracyPercentage = 100 - bestFaceMatch.distance * 100;

        const faceDetectionDrawBox = new draw.DrawBox(detectedFaceBox, {
            boxColor: FaceRecognitionService.FACE_BOX_HEX_COLOR,
            lineWidth: FaceRecognitionService.FACE_BOX_LINE_WIDTH,
            label: `${faceAccuracyPercentage.toFixed(2).toString()}/${minimumFaceRecognitionConfidencePercentage
                .toFixed(2)
                .toString()}`,
        });

        faceDetectionDrawBox.draw(faceDetectionCanvas);
    }
}
