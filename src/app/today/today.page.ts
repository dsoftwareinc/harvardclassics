import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {MaterialService} from '../services/material.service';


@Component({
    selector: 'app-today',
    templateUrl: './today.page.html',
    styleUrls: ['./today.page.scss'],
})
export class TodayPage implements OnInit {
    day: string;
    title: string;
    private header: string;
    private html: string;
    private sub: any;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private material: MaterialService,) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.day = params['day'];
            if (this.day === null || this.day === undefined) {
                this.day = moment().format('MM-DD');
            }
            this.title = moment('2016-' + this.day).format('MMMM DD');
            this.refreshView();
        });
    }

    private refreshView() {
        const splited = this.day.split('-');
        const month: string = splited[0];
        console.log(`Loading assets/${month}/${this.day}.html`);
        this.material.ready().then(json => {
            const dayData = json[month].filter(item => {
                return item.day === splited[1];
            });
            this.header = dayData['title'];
        });
        this.http.get(`assets/${month}/${this.day}.html`, {responseType: 'text'})
            .toPromise().then((html: string) => {
            this.html = html;
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }


}
