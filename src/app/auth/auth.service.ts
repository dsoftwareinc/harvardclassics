import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase';
import {Injectable} from '@angular/core';
import {EVENT_USER_LOGIN} from '../constants';
import {Events} from "../services/events.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public user: User;

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
        const authProvider = new auth.FacebookAuthProvider();
        this.afAuth.signInWithPopup(authProvider).then();
    }

    googleLogin() {
        const authProvider = new auth.GoogleAuthProvider();
        this.afAuth.signInWithPopup(authProvider).then();
    }

    async logout() {
        await this.afAuth.signOut();
        localStorage.removeItem('user');
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return user !== null;
    }
}
