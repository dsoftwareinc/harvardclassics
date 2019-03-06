import {Component, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {MaterialService} from '../services/material.service';
import {MONTHS} from '../app.component';
import {CalendarComponent, CalendarComponentOptions} from 'ion2-calendar';
import {routerNgProbeToken} from '@angular/router/src/router_module';

@Component({
    selector: 'app-month',
    templateUrl: './month.page.html',
    styleUrls: ['./month.page.scss'],
})
export class MonthPage implements OnInit {
    @ViewChild('calendar', {read: CalendarComponent}) calendarRef: CalendarComponent;
    @ViewChild('content') content;
    private sub: any;
    private month: string;
    monthName: string;
    data: Array<any> = null;
    dateMulti: string[] = [];
    optionsMulti: CalendarComponentOptions = {
        pickMode: 'multi',
        from: moment().startOf('year').toDate(),
        to: moment().endOf('year').toDate(),
        showMonthPicker: false,
        showToggleButtons: false,
    };


    constructor(private router: Router,
                private route: ActivatedRoute,
                private material: MaterialService) {

    }

    onSelect(dateSelected) {
        const day = dateSelected.title.length < 2 ? `0${dateSelected.title}` : dateSelected.title;
        // const yOffset = document.getElementById(`${this.month}-${dateSelected.title}`).offsetTop;
        // this.content.scrollTo(0, yOffset, 1000);
        this.router.navigateByUrl(`/day/${this.month}-${day}`).then();
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.month = params['month'];
            this.optionsMulti.from = moment().set('month', Number(this.month) - 1).startOf('month').toDate();
            this.optionsMulti.to = moment().set('month', Number(this.month) - 1).endOf('month').toDate();
            if (this.month.length < 2) {
                this.month = '0' + this.month;
            }
            this.monthName = MONTHS[Number(this.month) - 1];
        });
        this.material.ready().then(json => {
            this.data = json[this.month];
        });
    }

    ionViewDidEnter() {
        this.calendarRef.setViewDate(this.optionsMulti.from);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
