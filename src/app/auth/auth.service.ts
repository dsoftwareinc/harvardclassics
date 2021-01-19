import {AngularFireAuth} from '@angular/fire/auth';
import firebase from "firebase/app";
import {Injectable} from '@angular/core';
import {EVENT_USER_LOGIN} from '../constants';
import {Events} from "../services/events.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: firebase.User;

    constructor(private afAuth: AngularFireAuth,
                private events: Events,) {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.user = user;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.events.publish(EVENT_USER_LOGIN, user);
            } else {
                localStorage.setItem('user', null);
            }
        });
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return user !== null;
    }

    get userEmail() {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.email : '';
    }

    async emailSignup(email: string, password: string) {
        try {
            await this.afAuth.createUserWithEmailAndPassword(email, password);
        } catch (e) {
            alert('Error!' + e.message);
        }
    }

    async emailLogin(email: string, password: string) {
        try {
            await this.afAuth.signInWithEmailAndPassword(email, password);
        } catch (e) {
            alert('Error!' + e.message);
        }
    }

    facebookLogin() {
        const authProvider = new firebase.auth.FacebookAuthProvider();
        this.afAuth.signInWithPopup(authProvider).then();
    }

    googleLogin() {
        const authProvider = new firebase.auth.GoogleAuthProvider();
        this.afAuth.signInWithPopup(authProvider).then();
    }

    async logout() {
        await this.afAuth.signOut();
        localStorage.removeItem('user');
    }
}
