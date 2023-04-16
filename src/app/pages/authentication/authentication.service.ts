import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser } from './models';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private readonly authService: AuthService,
        private readonly httpClient: HttpClient,
    ) {}

    public login(): void {
        this.authService.loginWithRedirect({});
    }

    public logout(): void {
        this.authService.logout({ logoutParams: { returnTo: this.document.location.origin } });
    }

    public isLoadingAuthenticationModuleObservable(): Observable<boolean> {
        return this.authService.isLoading$;
    }

    public isAuthenticatedObservable(): Observable<boolean> {
        return this.authService.isAuthenticated$;
    }

    public isAuthenticated(): Promise<boolean> {
        return firstValueFrom(this.authService.isAuthenticated$);
    }

    public async getAuthenticatedUser(): Promise<AuthenticatedUser | undefined> {
        const user = await firstValueFrom(this.authService.user$);

        if (!user) {
            return undefined;
        }

        return firstValueFrom(this.httpClient.get<AuthenticatedUser>(`${environment.api.auth0.userInfo}/${user.sub}`));
    }
}
