import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { USER_CHECK_IN_PAGE, USER_PAGE } from '../../app-routing.module';

import { FaceRecognitionApiService } from '../../shared/face-recognition-api/face-recognition-api.service';
import { UserRoleEnum } from '../../shared/user-role';
import { AuthenticationService } from '../authentication/authentication.service';
import { USER_METADATA_TAG } from '../authentication/consts';
import { AuthenticatedUser } from '../authentication/models';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    protected storageUsedInBytes = 0;
    protected storageAvailableInBytes = 0;

    private user?: AuthenticatedUser;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly faceRecognitionApiService: FaceRecognitionApiService,
        private readonly router: Router,
    ) {}

    async ngOnInit(): Promise<void> {
        this.user = await this.authenticationService.getAuthenticatedUser();

        if (!this.user) {
            return;
        }

        // trigger caching
        void this.faceRecognitionApiService.getRecognitionDataList(this.user.user_metadata[USER_METADATA_TAG]);

        void this.setStorageQuota();
    }

    protected navigateToNextPage(): void {
        if (!this.user) {
            return;
        }

        if (this.user.app_metadata.role == UserRoleEnum.Admin) {
            this.router.navigateByUrl(USER_PAGE);
        } else {
            this.router.navigateByUrl(USER_CHECK_IN_PAGE);
        }
    }

    protected async setStorageQuota(): Promise<void> {
        if (!navigator.storage?.estimate) {
            this.storageUsedInBytes = -1;
            this.storageAvailableInBytes = -1;

            return;
        }

        const storageEstimation = await navigator.storage.estimate();
        this.storageUsedInBytes = storageEstimation.usage ?? -1;
        this.storageAvailableInBytes = storageEstimation.quota ?? -1;
    }
}
