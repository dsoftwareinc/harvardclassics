import {Component, OnInit} from '@angular/core';
import {auth} from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    constructor(
        public afAuth: AngularFireAuth,
    ) {

    }

    ngOnInit() {
    }

    login(method: string) {
        const authProvider = method === 'facebook' ? new auth.FacebookAuthProvider() : new auth.GoogleAuthProvider();
        this.afAuth.auth.signInWithPopup(authProvider).then();
    }
}
