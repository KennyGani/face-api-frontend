import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-check-in-user-policlinic-selection',
    templateUrl: './check-in-user-policlinic-selection.component.html',
    styleUrls: ['./check-in-user-policlinic-selection.component.scss'],
})
export class CheckInUserPoliclinicSelectionComponent implements OnInit {
    private static readonly DEFAULT_DIALOG_WIDTH = '55vw';
    private static readonly DEFAULT_DIALOG_HEIGHT = '89vh';

    protected selectedPoliclinicId?: number;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        protected data: {
            policlinicOptions: {
                policlinicName: string;
                policlinicId: number;
            }[];
        },
        private readonly dialogRef: MatDialogRef<CheckInUserPoliclinicSelectionComponent>,
    ) {}

    ngOnInit(): void {
        if (this.data.policlinicOptions.length > 0) {
            this.selectedPoliclinicId = this.data.policlinicOptions[0].policlinicId;
        }

        this.dialogRef.disableClose = true;
        this.dialogRef.updateSize(
            CheckInUserPoliclinicSelectionComponent.DEFAULT_DIALOG_WIDTH,
            CheckInUserPoliclinicSelectionComponent.DEFAULT_DIALOG_HEIGHT,
        );
    }
}
