import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-check-in-user-queue-number',
    templateUrl: './check-in-user-queue-number.component.html',
    styleUrls: ['./check-in-user-queue-number.component.scss'],
})
export class CheckInUserQueueNumberComponent implements OnInit {
    private static readonly DEFAULT_DIALOG_WIDTH = '55vw';
    private static readonly DEFAULT_DIALOG_HEIGHT = '55vh';

    constructor(
        @Inject(MAT_DIALOG_DATA)
        protected data: {
            name: string;
            queueId: number;
        },
        private readonly dialogRef: MatDialogRef<CheckInUserQueueNumberComponent>,
    ) {}

    ngOnInit(): void {
        this.dialogRef.updateSize(
            CheckInUserQueueNumberComponent.DEFAULT_DIALOG_WIDTH,
            CheckInUserQueueNumberComponent.DEFAULT_DIALOG_HEIGHT,
        );
        this.dialogRef.disableClose = true;
    }
}
