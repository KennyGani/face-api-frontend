import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HOME_PAGE, USER_CHECK_IN_PAGE, USER_CREATION_PAGE, USER_PAGE } from './app-routing.module';

import { AuthenticationService } from './pages/authentication/authentication.service';
import { UserRoleEnum } from './shared/user-role';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    protected isLoadingAuthenticationModuleObservable =
        this.authenticationService.isLoadingAuthenticationModuleObservable();
    protected isAuthenticatedObservable = this.authenticationService.isAuthenticatedObservable();
    protected isAdmin = false;

    protected navigateToHomePage = () => this.router.navigateByUrl(HOME_PAGE);
    protected navigateToUserCheckInPage = () => this.router.navigateByUrl(USER_CHECK_IN_PAGE);
    protected navigateToUserCreationPage = () => this.router.navigateByUrl(USER_CREATION_PAGE);
    protected navigateToUserSearchPage = () => this.router.navigateByUrl(USER_PAGE);

    constructor(private readonly authenticationService: AuthenticationService, private readonly router: Router) {}

    async ngOnInit(): Promise<void> {
        const user = await this.authenticationService.getAuthenticatedUser();

        if (!user) {
            throw new Error('user is not authenticated');
        }

        this.isAdmin = user.app_metadata.role === UserRoleEnum.Admin;
    }

    protected login(): void {
        this.authenticationService.login();
    }

    protected logout(): void {
        this.authenticationService.logout();
    }
}
