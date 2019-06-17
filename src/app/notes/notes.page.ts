import {Component, OnInit} from '@angular/core';
import {ReadingDbService} from '../services/readingdb.service';
import {MaterialService} from '../services/material.service';

@Component({
    selector: 'app-notes',
    templateUrl: './notes.page.html',
    styleUrls: ['./notes.page.scss'],
})
export class NotesPage implements OnInit {
    data: any;
    notes = {};

    constructor(private db: ReadingDbService,
                private material: MaterialService) {
    }

    ngOnInit() {
        this.material.ready().then(json => {
            this.data = json;
        });
        this.db.userDocValue().subscribe(data => {
            const userNotes = data.notes;
            this.notes = [];
            userNotes.forEach(note => {
                const month = note.day.substr(0, 2);
                const day = note.day.substr(3, 2);
                const key = '2016-' + note.day;
                this.notes[key] = this.notes[key] || [];
                this.notes[key].push({
                    title: +note.day,
                    day: note.day,
                    text: note.text,
                });
            });
            console.log(`Added ${userNotes.length} notes`);
        });
    }

    deleteNote(item: any) {
        this.db.removeHighlightedText(item.day, item.text);
    }
}
