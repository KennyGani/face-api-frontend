import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-page-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit, OnDestroy {
    constructor(private readonly spinner: NgxSpinnerService) {}

    ngOnInit() {
        this.spinner.show();
    }

    ngOnDestroy(): void {
        this.spinner.hide();
    }
}
