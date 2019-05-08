import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AlertDialogComponent} from "./dialogs/alert-dialog.component";
import {PromptDialogComponent} from "./dialogs/prompt-dialog.component";
import {ConfirmDialogComponent} from "./dialogs/confirm-dialog.component";
import {
    ActiveRoutePipe,
    CallbackPipe,
    ChildrenRouteActivePipe,
    DataUriPipe,
    HumanFileSizePipe,
    HumanizePipe,
    HumanizeUntilNowPipe,
    KeysPipe,
    ObservePipe,
    RangePipe,
    RouteSegmentEmptyPipe,
    ThrottlePipe
} from "./pipes";
import {ReactiveChangeDetectionModule} from "./reactivate-change-detection";
import {SimpleTableCellDirective, SimpleTableColumnDirective, SimpleTableComponent, SimpleTableHeaderDirective} from "./components/SimpleTableComponent";
import {MatDialogModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogHelper} from "./providers/dialog-helper";
import {BreadCrumbTextComponent, BreakCrumbComponent} from "./components/breakcrumb.component";
import {ProgressBarComponent} from "./components/progress-bar.component";
import {PlotlyComponent} from "./components/plotly.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IconComponent} from "./components/icon.component";
import {RedrawComponent} from "./components/redraw.component";
import {ProgressDialogComponent} from "./dialogs/progress-dialog.component";
import {RootComponent} from "./pages/root.component";
import {MonacoEditorModule} from "ngx-monaco-editor";
import {UserListComponent} from "./pages/admin/user-list.component";
import {AdminBreadCrumbComponent, AdminComponent} from "./pages/admin/admin.component";
import {ControllerClient} from "./providers/controller-client";
import {GaugeComponent} from "./components/gauge.component";
import {CreateUserDialogComponent} from "./dialogs/create-user-dialog.component";
import {UserComponent} from "./pages/admin/user.component";
import {CanActivateRoute} from "./providers/can-activate";
import {LoginComponent} from "./pages/login.component";
import {RedirectComponent} from "./pages/redirect.component";
import {Breadcrumbs} from "./providers/breadcrumbs";
import {UserSettingsComponent} from "./pages/admin/user-settings.component";
import {FileComponent} from "./components/file.component";
import {FocusDirective} from "../util-directives";
import {MenuComponent, MenuTriggerDirective} from "./components/menu.component";
import {models} from '@glut/admin-core';

@NgModule({
    declarations: [
        AppComponent,
        AlertDialogComponent,
        ConfirmDialogComponent,
        PromptDialogComponent,
        ProgressDialogComponent,

        //pipes
        HumanizePipe,
        HumanizeUntilNowPipe,
        ThrottlePipe,
        KeysPipe,
        ObservePipe,
        HumanFileSizePipe,
        CallbackPipe,
        ActiveRoutePipe,
        ChildrenRouteActivePipe,
        RouteSegmentEmptyPipe,
        RangePipe,
        DataUriPipe,

        SimpleTableComponent,
        SimpleTableColumnDirective,
        SimpleTableCellDirective,
        SimpleTableHeaderDirective,
        BreakCrumbComponent,
        ProgressBarComponent,
        PlotlyComponent,
        IconComponent,
        AdminBreadCrumbComponent,
        CreateUserDialogComponent,

        AdminComponent,
        UserListComponent,

        RedrawComponent,
        RootComponent,

        GaugeComponent,
        UserComponent,
        LoginComponent,
        MenuComponent,
        MenuTriggerDirective,

        RedirectComponent,
        BreadCrumbTextComponent,
        UserSettingsComponent,
        FileComponent,
        FocusDirective,
    ],
    entryComponents: [
        AlertDialogComponent,
        ConfirmDialogComponent,
        PromptDialogComponent,
        ProgressDialogComponent,

        AdminBreadCrumbComponent,
        CreateUserDialogComponent,
        BreadCrumbTextComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveChangeDetectionModule,
        MatIconModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MonacoEditorModule.forRoot(),
    ],
    providers: [
        DialogHelper,
        ControllerClient,
        CanActivateRoute,
        Breadcrumbs,
        // {provide: RouteReuseStrategy, useClass: ReuseStrategy},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    //necessary for registering on Marshal
    models = models;
}
