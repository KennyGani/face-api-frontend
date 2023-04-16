import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-check-in-user-identity-confirmation',
    templateUrl: './check-in-user-identity-confirmation.component.html',
    styleUrls: ['./check-in-user-identity-confirmation.component.scss'],
})
export class CheckInUserIdentityConfirmationComponent implements OnInit {
    private static readonly DEFAULT_DIALOG_WIDTH = '55vw';
    private static readonly DEFAULT_DIALOG_HEIGHT = '55vh';

    constructor(
        @Inject(MAT_DIALOG_DATA)
        protected data: {
            name: string;
        },
        private readonly dialogRef: MatDialogRef<CheckInUserIdentityConfirmationComponent>,
    ) {}

    ngOnInit(): void {
        this.dialogRef.updateSize(
            CheckInUserIdentityConfirmationComponent.DEFAULT_DIALOG_WIDTH,
            CheckInUserIdentityConfirmationComponent.DEFAULT_DIALOG_HEIGHT,
        );
        this.dialogRef.disableClose = true;
    }
}
