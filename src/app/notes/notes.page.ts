import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReadingDbService } from '../services/readingdb.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
  standalone: false
})
export class NotesPage implements OnInit, OnDestroy {
  notes: Record<string, { day: string; text: string }[]> = {};
  private dbSub: Subscription;

  constructor(private db: ReadingDbService) {
  }

  ngOnInit() {
    this.dbSub = this.db.userDocValue().subscribe(data => {
      this.notes = {};
      data.notes.forEach(note => {
        const key = '2016-' + note.day;
        this.notes[key] = this.notes[key] || [];
        this.notes[key].push({ day: note.day, text: note.text });
      });
    });
  }

  ngOnDestroy() {
    this.dbSub?.unsubscribe();
  }

  deleteNote(item: { day: string; text: string }) {
    this.db.removeHighlightedText(item.day, item.text);
  }
}
