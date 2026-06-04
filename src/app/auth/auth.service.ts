import { inject, Injectable, OnDestroy } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from '@angular/fire/auth';
import {EVENT_USER_LOGIN, EVENT_USER_LOGOUT} from '../constants';
import {Events} from "../services/events.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    private auth = inject(Auth);
    private unsubscribeAuth: () => void;
    user: any = null;

    constructor(private events: Events) {
        const stored = localStorage.getItem('user');
        if (stored) {
            this.user = JSON.parse(stored);
        }
        this.unsubscribeAuth = onAuthStateChanged(this.auth, user => {
            this.user = user ?? null;
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                this.events.publish(EVENT_USER_LOGIN, user);
            } else {
                localStorage.removeItem('user');
                this.events.publish(EVENT_USER_LOGOUT);
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribeAuth();
    }

    get isLoggedIn(): boolean {
        return this.user !== null;
    }

    get userEmail(): string | null {
        return this.user?.email ?? null;
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
