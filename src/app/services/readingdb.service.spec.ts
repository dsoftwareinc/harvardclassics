import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {of} from 'rxjs';
import {EMPTY} from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import {ReadingDbService} from './readingdb.service';
import {Events} from './events.service';
import {AuthService} from '../auth/auth.service';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {EVENT_FINISHED_READING, EVENT_USER_LOGIN, EVENT_USER_LOGOUT} from '../constants';

/** A minimal stand-in for AngularFirestoreDocument exposing only what the service uses. */
function makeDoc() {
    return {
        set: vi.fn().mockResolvedValue(undefined),
        get: vi.fn(),
        valueChanges: vi.fn(),
    };
}

const EMAIL = 'daniel@moransoftware.ca';

describe('ReadingDbService', () => {
    let doc: ReturnType<typeof makeDoc>;
    let afs: AngularFirestore & { doc: ReturnType<typeof vi.fn> };
    let events: Events;
    let unionSpy: ReturnType<typeof vi.spyOn>;
    let removeSpy: ReturnType<typeof vi.spyOn>;

    /** Builds a service whose constructor sees the given logged-in email (or none). */
    function createService(userEmail: string | null): ReadingDbService {
        const auth = {userEmail} as unknown as AuthService;
        return new ReadingDbService(auth, events, afs);
    }

    beforeEach(() => {
        doc = makeDoc();
        afs = {doc: vi.fn().mockReturnValue(doc)} as unknown as AngularFirestore & {
            doc: ReturnType<typeof vi.fn>;
        };
        events = new Events();
        // Spy without replacing the implementation: the real FieldValue sentinel is
        // still produced and handed to doc.set, we just observe the call direction.
        unionSpy = vi.spyOn(firebase.firestore.FieldValue, 'arrayUnion');
        removeSpy = vi.spyOn(firebase.firestore.FieldValue, 'arrayRemove');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('construction', () => {
        it('points userDoc at the logged-in user document', () => {
            createService(EMAIL);
            expect(afs.doc).toHaveBeenCalledWith(`/users/${EMAIL}`);
        });

        it('does not create a userDoc when no user is logged in', () => {
            createService(null);
            expect(afs.doc).not.toHaveBeenCalled();
        });
    });

    describe('marking a day read (EVENT_FINISHED_READING)', () => {
        it('atomically unions the day into the days array', () => {
            createService(EMAIL);

            events.publish(EVENT_FINISHED_READING, '01-01');

            expect(unionSpy).toHaveBeenCalledWith('01-01');
            expect(doc.set).toHaveBeenCalledWith(
                expect.objectContaining({days: expect.anything()}),
                {merge: true},
            );
        });

        it('is a no-op when no user is logged in', () => {
            createService(null);

            events.publish(EVENT_FINISHED_READING, '01-01');

            expect(doc.set).not.toHaveBeenCalled();
        });
    });

    describe('highlightText / removeHighlightedText', () => {
        it('unions the note when logged in', () => {
            const service = createService(EMAIL);

            service.highlightText('01-01', 'hello');

            expect(unionSpy).toHaveBeenCalledWith({day: '01-01', text: 'hello'});
            expect(doc.set).toHaveBeenCalledWith(
                expect.objectContaining({notes: expect.anything()}),
                {merge: true},
            );
        });

        it('removes the note via arrayRemove when logged in', () => {
            const service = createService(EMAIL);

            service.removeHighlightedText('01-01', 'hello');

            expect(removeSpy).toHaveBeenCalledWith({day: '01-01', text: 'hello'});
            expect(doc.set).toHaveBeenCalledWith(
                expect.objectContaining({notes: expect.anything()}),
                {merge: true},
            );
        });

        it('does nothing when not logged in', () => {
            const service = createService(null);

            service.highlightText('01-01', 'hello');
            service.removeHighlightedText('01-01', 'hello');

            expect(doc.set).not.toHaveBeenCalled();
        });
    });

    describe('toggleFavorite', () => {
        it('adds the day when it is not yet a favorite', () => {
            doc.get.mockReturnValue(of({data: () => ({favorites: []})}));
            const service = createService(EMAIL);

            service.toggleFavorite('01-01');

            expect(unionSpy).toHaveBeenCalledWith('01-01');
            expect(removeSpy).not.toHaveBeenCalled();
        });

        it('removes the day when it is already a favorite', () => {
            doc.get.mockReturnValue(of({data: () => ({favorites: ['01-01']})}));
            const service = createService(EMAIL);

            service.toggleFavorite('01-01');

            expect(removeSpy).toHaveBeenCalledWith('01-01');
            expect(unionSpy).not.toHaveBeenCalled();
        });

        it('treats a document with no favorites field as empty (adds the day)', () => {
            doc.get.mockReturnValue(of({data: () => ({})}));
            const service = createService(EMAIL);

            service.toggleFavorite('01-01');

            expect(unionSpy).toHaveBeenCalledWith('01-01');
        });

        it('is a no-op when not logged in', () => {
            const service = createService(null);

            service.toggleFavorite('01-01');

            expect(doc.get).not.toHaveBeenCalled();
            expect(doc.set).not.toHaveBeenCalled();
        });
    });

    describe('userDocValue', () => {
        it('returns the document valueChanges stream when logged in', () => {
            const stream = of({days: [], favorites: [], notes: []});
            doc.valueChanges.mockReturnValue(stream);
            const service = createService(EMAIL);

            expect(service.userDocValue()).toBe(stream);
        });

        it('returns EMPTY when not logged in', () => {
            const service = createService(null);

            expect(service.userDocValue()).toBe(EMPTY);
        });
    });

    describe('login / logout re-pointing', () => {
        it('repoints userDoc at the newly logged-in user', () => {
            createService(null);
            expect(afs.doc).not.toHaveBeenCalled();

            events.publish(EVENT_USER_LOGIN, {email: 'new@example.com'});

            expect(afs.doc).toHaveBeenCalledWith('/users/new@example.com');
        });

        it('clears userDoc when a login event carries no email', () => {
            const service = createService(EMAIL);

            events.publish(EVENT_USER_LOGIN, {});
            service.highlightText('01-01', 'x');

            expect(doc.set).not.toHaveBeenCalled();
        });

        it('clears userDoc on logout so later writes are no-ops', () => {
            const service = createService(EMAIL);

            events.publish(EVENT_USER_LOGOUT);
            service.highlightText('01-01', 'x');

            expect(doc.set).not.toHaveBeenCalled();
            expect(service.userDocValue()).toBe(EMPTY);
        });
    });

    describe('ngOnDestroy', () => {
        it('unsubscribes the finished-reading handler', () => {
            const service = createService(EMAIL);
            service.ngOnDestroy();

            events.publish(EVENT_FINISHED_READING, '01-01');

            expect(doc.set).not.toHaveBeenCalled();
        });
    });
});
