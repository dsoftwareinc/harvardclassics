import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {MaterialService} from '../services/material.service';
import {AnalyticsProvider} from '../services/analytics.service';


@Component({
    selector: 'app-today',
    templateUrl: './today.page.html',
    styleUrls: ['./today.page.scss'],
})
export class TodayPage implements OnInit {
    day: string;
    title: string;
    header: string;
    html: string;
    private sub: any;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private material: MaterialService,
                public analytics: AnalyticsProvider) {
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

    private refreshView() {
        this.analytics.trackView(`day-${this.day}`);
        this.title = moment('2016-' + this.day).format('MMMM DD');
        const splited = this.day.split('-');
        const month: string = splited[0];
        console.log(`Loading assets/${month}/${this.day}.html`);
        this.material.ready().then(json => {
            const dayData = json[month].find(item => {
                return item.day === splited[1];
            });
            this.header = dayData['title'];
            this.html = dayData['content'];
        });
        // this.http.get(`assets/${month}/${this.day}.html`, {responseType: 'text'})
        //     .toPromise().then((html: string) => {
        //     this.html = html;
        // });
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
