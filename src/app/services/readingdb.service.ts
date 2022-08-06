import {Injectable} from '@angular/core';
import {EVENT_FINISHED_READING} from '../constants';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore';

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

@Injectable({
    providedIn: 'root'
})
export class ReadingDbService {
    private userDoc: AngularFirestoreDocument<Item> = null;
    private INITIAL_DATA = {
        days: [],
        favorites: [],
        notes: []
    };

    constructor(private auth: AuthService,
                private events: Events,
                private afs: AngularFirestore) {
        if (this.auth.userEmail) {
            console.log(`User authenticating ${this.auth.userEmail}`);
            this.userDoc = afs.doc<Item>(`/users/${this.auth.userEmail}`);
        }
        events.subscribe(EVENT_FINISHED_READING, day => {
            this.markDayAsRead(day);
        });
    }

    public highlightText(day: string, text: string): void {
        if (this.auth.userEmail === null) {
            console.log('User not logged in, not saving days read');
            return;
        }
        this.userDoc.get().subscribe((val) => {
            if (val.exists) {
                const data = val.data();
                data.notes.push({day: day, text: text});
                this.userDoc.update(data).then();
            } else {
                const data = this.INITIAL_DATA;
                data.notes.push({day: day, text: text});
                this.userDoc.set(data).then();
            }
        });
    }

    public removeHighlightedText(day: string, text: string): void {
        if (this.auth.userEmail === null) {
            console.log('User not logged in, not saving days read');
            return;
        }
        this.userDoc.get().subscribe((val) => {
            if (val.exists) {
                const data = val.data();

                const idx = this.searchNoteInNotes(data.notes, day, text);
                if (idx !== -1) {
                    data.notes.splice(idx, 1);
                    this.userDoc.update(data).then();
                }
            } else {
                const data = this.INITIAL_DATA;
                data.notes.push({day: day, text: text});
                this.userDoc.set(data).then();
            }
        });
    }

    userDocValue() {
        if (this.auth.userEmail === null) {
            console.log('User not logged in, not returning days read');
            return EMPTY;
        }
        return this.userDoc?.valueChanges();
    }

    toggleFavorite(day: string) {
        if (this.auth.userEmail === null) {
            console.log('User not logged in, not saving days read');
            return;
        }
        this.userDoc.get().subscribe((val) => {
            if (val.exists) {
                const data = val.data();
                const dayIndex = data.favorites.indexOf(day);
                if (dayIndex === -1) {
                    data.favorites.push(day);
                } else {
                    data.favorites.splice(dayIndex, 1);
                }
                this.userDoc.update(data).then();
            } else {
                const data = this.INITIAL_DATA;
                data.favorites.push(day);
                this.userDoc.set(data).then();
            }
        });
    }

    private searchNoteInNotes(notes: Note[], day: string, text: string): number {
        for (let i = 0; i < notes.length; i++) {
            const item = notes[i];
            if (item.day === day && item.text === text) {
                return i;
            }
        }
        return -1;
    }

    // get ready() {
    //     return this.userDoc !== null;
    // }

    private markDayAsRead(day: string): void {
        if (this.auth.userEmail === null) {
            console.log('User not logged in, not saving days read');
            return;
        }
        this.userDoc.get().subscribe((val) => {
            if (val.exists) {
                const data = val.data();
                if (data.days.indexOf(day) === -1) {
                    data.days.push(day);
                    this.userDoc.update(data).then();
                }
            } else {
                const data = this.INITIAL_DATA;
                data.days.push(day);
                this.userDoc.set(data).then();
            }
        });
    }
}
