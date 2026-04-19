import {Component} from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.page.html',
    styleUrls: ['./signup.page.scss'],
    standalone: false
})
export class SignupPage {
    userEmail: string;
    userPassword: string;

    constructor(public authService: AuthService) {}
}
