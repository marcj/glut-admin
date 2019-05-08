import {AfterViewInit, ChangeDetectorRef, Component} from "@angular/core";
import {ControllerClient} from "../providers/controller-client";
import {ActivatedRoute, Router} from "@angular/router";
import {Validators, FormBuilder} from "@angular/forms";
import {sleep} from "@marcj/estdlib";

@Component({
    template: `
        <div class="bg dark">
            <div class="box" mat-dialog-content>
                
                <div class="logo">
                    <img src="assets/images/logo-white.png"/>
                </div>
                
                <h3>LOGIN</h3>
                
                <form (ngSubmit)="logIn()" [formGroup]="loginForm" >
                    <div>
                        <input type="text" focus formControlName="username" placeholder="Username"/>
                    </div>
                    <div>
                        <input type="password" formControlName="password" placeholder="Password"/>
                    </div>

                    <div *ngIf="loginInvalid" class="error">
                        Invalid login.
                    </div>

                    <div *ngIf="loadingFailed" class="error">
                        Loading user information failed.
                    </div>

                    <div *ngIf="insufficientPermissions" class="error">
                        Insufficient permissions. Please login as another user with more rights.
                    </div>

                    <div class="actions">
                        <button type="submit" class="last" [disabled]="!loginForm.valid || loading">Login</button>
                    </div>
                </form>
            </div>
        </div>
    `,
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
    public model = {username: '', password: ''};
    public loginInvalid = false;
    public loading = false;
    public insufficientPermissions = false;
    public loadingFailed = false;

    public readonly loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(
        private controllerClient: ControllerClient,
        private route: ActivatedRoute,
        private router: Router,
        private cd: ChangeDetectorRef,
        private fb: FormBuilder,
    ) {
        console.log('this.route.snapshot', this.route.snapshot);
        this.insufficientPermissions = Boolean(this.route.snapshot.queryParams['insufficientPermissions']);
    }

    ngAfterViewInit(): void {
    }

    public async logIn() {
        this.loginInvalid = false;
        this.loadingFailed = false;
        this.loading = true;
        this.cd.detectChanges();

        try {
            await sleep(0.3);
            const token = await this.controllerClient.app().login(this.loginForm.value.username, this.loginForm.value.password);
            if (!token) {
                this.loginInvalid = true;
                return;
            }

            sessionStorage.setItem('glutAccessToken', token);
            this.controllerClient.clearClient();

            try {
                await this.controllerClient.loadUser();
            } catch (error) {
                this.loadingFailed = true;
            }

            if (this.controllerClient.isLoggedIn()) {
                const redirect = this.route.snapshot.queryParams['redirect'] || '/';
                console.log('redirect to', redirect);
                await this.router.navigateByUrl(redirect);
            }
        } finally {
            this.loading = false;
            this.cd.detectChanges();
        }
    }
}
