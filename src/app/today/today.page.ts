import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {MaterialService} from '../services/material.service';
import {AnalyticsProvider} from '../services/analytics.service';
import {ActionSheetController, ScrollCustomEvent} from '@ionic/angular';
import {EVENT_FINISHED_READING} from '../constants';
import {TextSelectEventDirective} from './text-select-event.directive';
import {ReadingDbService} from '../services/readingdb.service';
import {Events} from "../services/events.service";


@Component({
    selector: 'app-today',
    templateUrl: './today.page.html',
    styleUrls: ['./today.page.scss'],
})
export class TodayPage implements OnInit {
    @ViewChild('content', {static: true}) content;
    @ViewChild('articleContent', {static: true}) articleContent;
    yesterday: string;
    tomorrow: string;
    day: string;
    title: string;
    header: string;
    html: string;
    isFavorite: boolean = false;
    progress = 0;
    notes: string[] = [];
    private sub: any;
    private clientHeight = 0;
    private markAsRead: boolean = false;

    constructor(private route: ActivatedRoute,
                private material: MaterialService,
                private events: Events,
                private analytics: AnalyticsProvider,
                private actionSheetController: ActionSheetController,
                private db: ReadingDbService,) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.day = params['day'];
            if (this.day === null || this.day === undefined) {
                this.day = moment().format('MM-DD');
            }
            this.refreshView();
        });
    }

    ionViewDidEnter() {
        this.clientHeight = this.content.el.clientHeight;
        this.progress = this.clientHeight / this.articleContent.nativeElement.offsetHeight;
    }

    onPageScroll(event: ScrollCustomEvent) {
        this.progress = (event.detail.scrollTop + this.clientHeight) /
            this.articleContent.nativeElement.offsetHeight;
        if (this.progress >= 1 && !this.markAsRead) {
            this.markAsRead = true;
            this.events.publish(EVENT_FINISHED_READING, this.day);
        }
    }

    public async textSelected(event: TextSelectEventDirective) {
        if (event.text.trim() === '') {
            return;
        }
        const actionSheet = await this.actionSheetController.create({
            header: 'Highlighted text',
            buttons: [{
                text: 'Note text',
                icon: 'bookmarks',
                handler: () => {
                    this.db.highlightText(this.day, event.text);
                }
            }, {
                text: 'Cancel',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        });
        await actionSheet.present();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    calcDay(numberOfDays: number) {
        const date = moment('2015-' + this.day).add(numberOfDays, 'days');
        this.day = date.format('MM-DD');
        this.refreshView();
    }

    toggleFavorite() {
        this.db.toggleFavorite(this.day);
        this.isFavorite = !this.isFavorite;
    }

    unmark(event: Event) {
        console.log(event);
    }

    highlightedHtml(text: string, searchStrs: string[]): string {
        if (!text || !searchStrs || searchStrs.length === 0) {
            return text;
        }
        try {
            text = text.replace(/(\r\n|\n|\r)/gm, ' ');
            searchStrs.forEach(query => {
                const startIndex = text.toLowerCase().indexOf(query.toLowerCase());
                if (startIndex !== -1) {
                    const matchingString = text.substring(startIndex, query.length);
                    text = text.replace(matchingString,
                        `<span (click)="unmark($event)" class="highlight">${matchingString}</span>`);
                }
            });
        } catch (exception) {
            console.error('error in highlight:', exception);
        }
        return text;
    }

    private refreshView() {
        this.analytics.trackView(`day-${this.day}`);
        const today = moment('2016-' + this.day);
        this.title = moment('2016-' + this.day).format('MMMM DD');
        this.yesterday = today.subtract(1, 'days').format('MMM DD');
        this.tomorrow = today.add(2, 'days').format('MMM DD');
        const split = this.day.split('-');
        const month: string = split[0];
        console.log(`Loading assets/${month}/${this.day}`);
        this.material.ready().then(json => {
            const dayData = json[month].find(item => {
                return item.day === split[1];
            });
            this.header = dayData['title'];
            this.html = dayData['content'];
            this.content.scrollToTop();
        });
        this.db.userDocValue().subscribe((val) => {
            this.isFavorite = (val.favorites !== undefined && val.favorites.indexOf(this.day) !== -1);
            this.notes = val.notes
                .filter(note => note.day === this.day)
                .map(note => note.text);
            this.html = this.highlightedHtml(this.html, this.notes);
        });
    }

}
