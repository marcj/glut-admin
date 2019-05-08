import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from "./pages/root.component";
import {UserListComponent} from "./pages/admin/user-list.component";
import {AdminComponent} from "./pages/admin/admin.component";
import {UserComponent} from "./pages/admin/user.component";
import {CanActivateRoute} from "./providers/can-activate";
import {LoginComponent} from "./pages/login.component";
import {RoleType} from "@glut/admin-core";
import {RedirectComponent} from "./pages/redirect.component";
import {UserSettingsComponent} from "./pages/admin/user-settings.component";


const routes: Routes = [
    {path: 'redirect', component: RedirectComponent},
    {path: 'login', component: LoginComponent},
    {
        path: '', component: RootComponent, data: {role: RoleType.regular},
        canActivate: [CanActivateRoute],
        canActivateChild: [CanActivateRoute],
        children: [
            {
                path: 'admin',
                component: AdminComponent,
                data: {role: RoleType.admin},
                children: [
                    {path: '', redirectTo: 'user', pathMatch: 'full'},
                    {path: 'user', component: UserListComponent, children: []},
                    {
                        path: 'user/:userId', component: UserComponent, children: [
                            {path: '', redirectTo: 'settings', pathMatch: 'full'},
                            {path: 'settings', component: UserSettingsComponent, children: []},
                        ]
                    },
                ]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
