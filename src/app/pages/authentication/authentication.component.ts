import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Component({
    selector: 'app-authentication',
    templateUrl: './authentication.component.html',
    styleUrls: ['./authentication.component.scss'],
})
export class AuthenticationComponent implements OnInit {
    constructor(private readonly authenticationService: AuthenticationService, private readonly router: Router) {}

    async ngOnInit(): Promise<void> {
        const isAuthenticated = await this.authenticationService.isAuthenticated();

        if (isAuthenticated) {
            this.router.navigateByUrl(''); // go to default route
        } else {
            this.authenticationService.login();
        }
    }
}
