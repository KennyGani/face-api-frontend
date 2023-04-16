import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

import { ActionComponent } from './pages/action/action.component';
import { CheckInUserComponent } from './pages/action/check-in-user/check-in-user.component';
import { CreateUserComponent } from './pages/action/create-user/create-user.component';
import { UpdateUserFaceModelComponent } from './pages/action/update-user-face-model/update-user-face-model.component';
import { UpdateUserProfileComponent } from './pages/action/update-user-profile/update-user-profile.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { HomeComponent } from './pages/home/home.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { UserProfileComponent } from './pages/user/user-profile/user-profile.component';
import { UserComponent } from './pages/user/user.component';

const ACTION_PAGE = 'action';
const ACTION_USER_CREATION_SUB_PAGE = 'create-user';
const ACTION_USER_CHECK_IN_SUB_PAGE = 'check-in-user';
const ACTION_USER_UPDATE_SUB_PAGE = 'update-user-profile';
const ACTION_USER_FACE_UPDATE_SUB_PAGE = 'update-user-face-model';

export const AUTHENTICATION_PAGE = 'authentication';
export const HOME_PAGE = 'home';
export const USER_PAGE = 'user';
export const USER_CREATION_PAGE = `${ACTION_PAGE}/${ACTION_USER_CREATION_SUB_PAGE}`;
export const USER_CHECK_IN_PAGE = `${ACTION_PAGE}/${ACTION_USER_CHECK_IN_SUB_PAGE}`;
export const USER_UPDATE_PAGE = `${ACTION_PAGE}/${ACTION_USER_UPDATE_SUB_PAGE}`;
export const USER_FACE_UPDATE_PAGE = `${ACTION_PAGE}/${ACTION_USER_FACE_UPDATE_SUB_PAGE}`;

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home',
    },
    {
        path: HOME_PAGE,
        pathMatch: 'full',
        component: HomeComponent,
        canActivate: [AuthGuard],
    },
    {
        path: USER_PAGE,
        children: [
            {
                path: '',
                component: UserListComponent,
                canActivate: [AuthGuard],
            },
            {
                path: ':id',
                component: UserProfileComponent,
                pathMatch: 'full',
                canActivate: [AuthGuard],
            },
        ],
        component: UserComponent,
        canActivate: [AuthGuard],
    },
    {
        path: ACTION_PAGE,
        children: [
            {
                path: ACTION_USER_UPDATE_SUB_PAGE,
                component: UpdateUserProfileComponent,
                pathMatch: 'full',
                canActivate: [AuthGuard],
            },
            {
                path: ACTION_USER_FACE_UPDATE_SUB_PAGE,
                component: UpdateUserFaceModelComponent,
                pathMatch: 'full',
                canActivate: [AuthGuard],
            },
            {
                path: ACTION_USER_CREATION_SUB_PAGE,
                component: CreateUserComponent,
                pathMatch: 'full',
                canActivate: [AuthGuard],
            },
            {
                path: ACTION_USER_CHECK_IN_SUB_PAGE,
                component: CheckInUserComponent,
                pathMatch: 'full',
                canActivate: [AuthGuard],
            },
        ],
        component: ActionComponent,
        canActivate: [AuthGuard],
    },
    {
        path: AUTHENTICATION_PAGE,
        pathMatch: 'full',
        component: AuthenticationComponent,
    },
    {
        path: '**', // Wildcard route for a 404 page
        pathMatch: 'full',
        redirectTo: HOME_PAGE,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
