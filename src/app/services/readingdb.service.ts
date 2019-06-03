import {Injectable} from '@angular/core';
import {Events} from '@ionic/angular';
import {EVENT_FINISHED_READING} from '../constants';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';

export interface Item {
    days: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ReadingDbService {
    private email: string = null;
    private userDoc: AngularFirestoreDocument<Item>;

    constructor(private afAuth: AngularFireAuth,
                private events: Events,
                private afs: AngularFirestore) {
        console.log('User authenticating');
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.email = user.email;
                this.userDoc = afs.doc<Item>(`users/${this.email}`);
            }
        });
        events.subscribe(EVENT_FINISHED_READING, day => {
            this.addItem(day);
        });
    }

    addItem(day: string) {
        if (this.email === null) {
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
                const data = {days: [day]};
                this.userDoc.set(data).then();
            }
        });
    }

    daysRead() {
        return this.userDoc.valueChanges();
    }


}
