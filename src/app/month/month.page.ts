import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MaterialService} from '../services/material.service';
import {MONTHS} from '../app.component';

@Component({
    selector: 'app-month',
    templateUrl: './month.page.html',
    styleUrls: ['./month.page.scss'],
})
export class MonthPage implements OnInit {
    private sub: any;
    private month: string;
    private monthName: string;
    private data: Array<any> = null;

    constructor(private route: ActivatedRoute,
                private material: MaterialService) {

    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.month = params['month'];
            if (this.month.length < 2) {
                this.month = '0' + this.month;
            }
            this.monthName = MONTHS[Number(this.month) - 1];
        });
        this.material.ready().then(json => {
            this.data = json[this.month];
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
