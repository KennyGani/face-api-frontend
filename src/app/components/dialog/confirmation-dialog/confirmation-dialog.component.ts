import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
    private static readonly DEFAULT_DIALOG_WIDTH = '55vw';
    private static readonly DEFAULT_DIALOG_HEIGHT = '55vh';

    protected title = '';
    protected message = '';
    protected confirmationMessage = '';

    constructor(
        @Inject(MAT_DIALOG_DATA) protected data: { title: string; message: string; confirmationMessage: string },
        private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    ) {
        this.title = data.title;
        this.message = data.message;
        this.confirmationMessage = data.confirmationMessage;
    }

    ngOnInit(): void {
        this.dialogRef.updateSize(
            ConfirmationDialogComponent.DEFAULT_DIALOG_WIDTH,
            ConfirmationDialogComponent.DEFAULT_DIALOG_HEIGHT,
        );
        this.dialogRef.disableClose = true;
    }
}
