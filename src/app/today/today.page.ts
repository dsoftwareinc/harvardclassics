import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {MaterialService} from '../services/material.service';
import {AnalyticsProvider} from '../services/analytics.service';
import {Events} from '@ionic/angular';
import {EVENT_FINISHED_READING} from '../constants';
import {TextSelectEventDirective} from './text-select-event.directive';


@Component({
    selector: 'app-today',
    templateUrl: './today.page.html',
    styleUrls: ['./today.page.scss'],
})
export class TodayPage implements OnInit {
    @ViewChild('content', {static: true}) content;
    @ViewChild('articleContent', {static: true}) articleContent;
    day: string;
    title: string;
    header: string;
    html: string;
    private sub: any;
    progress = 0;
    private clientHeight = 0;
    private markAsRead: boolean = false;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private material: MaterialService,
                private events: Events,
                private analytics: AnalyticsProvider) {
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

    onPageScroll(event) {
        this.progress = (event.detail.scrollTop + this.clientHeight) /
            this.articleContent.nativeElement.offsetHeight;
        if (this.progress >= 1 && !this.markAsRead) {
            this.markAsRead = true;
            this.events.publish(EVENT_FINISHED_READING, this.day);
        }
    }

    private refreshView() {
        this.analytics.trackView(`day-${this.day}`);
        this.title = moment('2016-' + this.day).format('MMMM DD');
        const splited = this.day.split('-');
        const month: string = splited[0];
        console.log(`Loading assets/${month}/${this.day}`);
        this.material.ready().then(json => {
            const dayData = json[month].find(item => {
                return item.day === splited[1];
            });
            this.header = dayData['title'];
            this.html = dayData['content'];
            this.content.scrollToTop();
        });
        // this.http.get(`assets/${month}/${this.day}.html`, {responseType: 'text'})
        //     .toPromise().then((html: string) => {
        //     this.html = html;
        // });
    }

    public renderRectangles(event: TextSelectEventDirective): void {

        console.group('Text Select Event');
        console.log('Text:', event.text);
        console.log('Viewport Rectangle:', event.viewportRectangle);
        console.log('Host Rectangle:', event.hostRectangle);
        console.groupEnd();

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    calcDay(numberOfDays: number) {
        const date = moment('2015-' + this.day).add(numberOfDays, 'days');
        this.day = date.format('MM-DD');
        this.refreshView();
    }
}
