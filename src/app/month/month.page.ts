import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MaterialService } from "../services/material.service";
import { MONTHS } from "../app.component";
import { ReadingDbService } from "../services/readingdb.service";
import { AuthService } from "../auth/auth.service";
import { AngularFireAnalytics } from "@angular/fire/compat/analytics";
import {
  CalendarComponent,
  ICalendarComponentOptions,
  ICalendarModalOptions,
} from "@heliomarpm/ion-calendar";
import { DateTime } from "luxon";

@Component({
  selector: "app-month",
  templateUrl: "./month.page.html",
  styleUrls: ["./month.page.scss"],
})
export class MonthPage implements OnInit {
  @ViewChild("calendar", { read: CalendarComponent, static: true })
  calendarRef: CalendarComponent;
  @ViewChild("content", { static: true }) content;
  monthName: string;
  data: Array<any> = null;
  dateMulti: string[] = [];
  optionsMulti: ICalendarModalOptions = {
    pickMode: "multi",
    //showMonthPicker: false,
    //showToggleButtons: false,
  };
  private sub: any;
  month: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private material: MaterialService,
    private analytics: AngularFireAnalytics,
    private readDb: ReadingDbService,
  ) { }

  onSelect(dateSelected) {
    const day =
      dateSelected.title.length < 2
        ? `0${dateSelected.title}`
        : dateSelected.title;
    // const yOffset = document.getElementById(`${this.month}-${dateSelected.title}`).offsetTop;
    // this.content.scrollTo(0, yOffset, 1000);
    this.router.navigateByUrl(`/day/${this.month}-${day}`).then();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.month = params["month"];
      const month = Number(this.month);
      const currentDate = DateTime.now().set({ months: month });

      this.optionsMulti.from = currentDate.startOf("month").toJSDate();
      this.optionsMulti.to = currentDate.endOf("month").toJSDate();
      this.optionsMulti.defaultScrollTo = currentDate;
      this.calendarRef.calendarMonthValue = currentDate;
      console.log(this.optionsMulti);
      if (this.month.length < 2) {
        this.month = "0" + this.month;
      }
      this.monthName = MONTHS[Number(this.month) - 1];
    });
    this.readDb.userDocValue().subscribe((data) => {
      const year = DateTime.now().year();
      this.dateMulti = [];
      data.days.forEach((x) => this.dateMulti.push(year + "-" + x));
    });
    this.material.ready().then((json) => {
      this.data = json[this.month];
    });
  }

  ionViewDidEnter() {
    this.analytics.setCurrentScreen(`month-${this.monthName}`);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
