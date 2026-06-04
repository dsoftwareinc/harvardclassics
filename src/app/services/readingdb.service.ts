import {Injectable, OnDestroy} from '@angular/core';
import {EVENT_FINISHED_READING, EVENT_USER_LOGIN, EVENT_USER_LOGOUT} from '../constants';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
// Side-effect import: attaches the `firestore` namespace (incl. FieldValue) onto `firebase`.
import 'firebase/compat/firestore';

import {EMPTY} from 'rxjs';
import {Events} from "./events.service";
import {AuthService} from "../auth/auth.service";

export interface Note {
    day: string;
    text: string;
}

export interface Item {
    days: string[];
    favorites: string[];
    notes: Note[];
}

const arrayUnion = (...elements: unknown[]) => firebase.firestore.FieldValue.arrayUnion(...elements);
const arrayRemove = (...elements: unknown[]) => firebase.firestore.FieldValue.arrayRemove(...elements);

@Injectable({
    providedIn: 'root'
})
export class ReadingDbService implements OnDestroy {
    private userDoc: AngularFirestoreDocument<Item> | null = null;
    private markDayAsReadHandler = (day: string) => this.markDayAsRead(day);

    constructor(private auth: AuthService,
                private events: Events,
                private afs: AngularFirestore) {
        if (this.auth.userEmail) {
            this.userDoc = afs.doc<Item>(`/users/${this.auth.userEmail}`);
        }
        events.subscribe(EVENT_FINISHED_READING, this.markDayAsReadHandler);
        events.subscribe(EVENT_USER_LOGIN, (user: any) => {
            this.userDoc = user?.email ? afs.doc<Item>(`/users/${user.email}`) : null;
        });
        events.subscribe(EVENT_USER_LOGOUT, () => {
            this.userDoc = null;
        });
    }

    ngOnDestroy() {
        this.events.unsubscribe(EVENT_FINISHED_READING, this.markDayAsReadHandler);
    }

    public highlightText(day: string, text: string): void {
        if (!this.userDoc) {
            return;
        }
        // arrayUnion + merge creates the doc if absent and is atomic w.r.t. concurrent writes.
        this.userDoc.set({notes: arrayUnion({day, text})} as unknown as Item, {merge: true})
            .catch(err => console.error('Error saving note:', err));
    }

    public removeHighlightedText(day: string, text: string): void {
        if (!this.userDoc) {
            return;
        }
        // arrayRemove matches array elements by deep equality, so {day, text} removes the exact note.
        this.userDoc.set({notes: arrayRemove({day, text})} as unknown as Item, {merge: true})
            .catch(err => console.error('Error removing note:', err));
    }

    userDocValue() {
        if (!this.userDoc) {
            console.log('User not logged in, not returning days read');
            return EMPTY;
        }
        return this.userDoc.valueChanges();
    }

    toggleFavorite(day: string) {
        if (!this.userDoc) {
            return;
        }
        const doc = this.userDoc;
        // Read only to decide direction; the write itself is an atomic field op, so it
        // never clobbers concurrent changes to days/notes.
        doc.get().subscribe((snap) => {
            const isFavorite = (snap.data()?.favorites ?? []).indexOf(day) !== -1;
            const change = isFavorite ? arrayRemove(day) : arrayUnion(day);
            doc.set({favorites: change} as unknown as Item, {merge: true})
                .catch(err => console.error('Error updating favorites:', err));
        });
    }

    private markDayAsRead(day: string): void {
        if (!this.userDoc) {
            return;
        }
        // arrayUnion is idempotent, so no need to read-and-check before writing.
        this.userDoc.set({days: arrayUnion(day)} as unknown as Item, {merge: true})
            .catch(err => console.error('Error marking day as read:', err));
    }
}
