import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase';
import {Injectable} from '@angular/core';
import {Events} from '@ionic/angular';
import {EVENT_USER_LOGIN} from '../constants';

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
            await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
        } catch (e) {
            alert('Error!' + e.message);
        }
    }

    async emailLogin(email: string, password: string) {
        try {
            await this.afAuth.auth.signInWithEmailAndPassword(email, password);
        } catch (e) {
            alert('Error!' + e.message);
        }
    }

    facebookLogin() {
        const authProvider = new auth.FacebookAuthProvider();
        this.afAuth.auth.signInWithPopup(authProvider).then();
    }

    googleLogin() {
        const authProvider = new auth.GoogleAuthProvider();
        this.afAuth.auth.signInWithPopup(authProvider).then();
    }

    async logout() {
        await this.afAuth.auth.signOut();
        localStorage.removeItem('user');
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return user !== null;
    }
}
