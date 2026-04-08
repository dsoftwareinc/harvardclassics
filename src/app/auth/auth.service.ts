import { inject, Injectable } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from '@angular/fire/auth';
import {EVENT_USER_LOGIN} from '../constants';
import {Events} from "../services/events.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);
    user: any;

    constructor(private events: Events) {
        onAuthStateChanged(this.auth, user => {
            if (user) {
                this.user = user;
                localStorage.setItem('user', JSON.stringify(user));
                this.events.publish(EVENT_USER_LOGIN, user);
            } else {
                localStorage.removeItem('user');
            }
        });
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user'));
        return user !== null;
    }

    get userEmail() {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.email : null;
    }

    async emailSignup(email: string, password: string) {
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
        } catch (e) {
            console.error('Signup error:', e);
            alert('Sign up failed. Please check your details and try again.');
        }
    }

    async emailLogin(email: string, password: string) {
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
        } catch (e) {
            console.error('Login error:', e);
            alert('Login failed. Please check your email and password.');
        }
    }

    googleLogin() {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        return signInWithPopup(this.auth, provider);
    }

    async logout() {
        localStorage.removeItem('user');
        await signOut(this.auth);
    }
}
