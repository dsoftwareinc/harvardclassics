import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: false
})
export class LoginPage implements OnInit {
    userEmail!: string;
    userPassword!: string;

    constructor(public authService: AuthService, private router: Router) {}

    ngOnInit() {}

    async emailLogin() {
        await this.authService.emailLogin(this.userEmail, this.userPassword);
        if (this.authService.isLoggedIn) {
            await this.router.navigateByUrl('/today', {replaceUrl: true});
        }
    }

    async googleLogin() {
        const result = await this.authService.googleLogin();
        if (result?.user) {
            await this.router.navigateByUrl('/today', {replaceUrl: true});
        }
    }
}
