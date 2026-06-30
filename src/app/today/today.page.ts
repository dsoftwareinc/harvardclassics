import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MaterialService } from "../services/material.service";
import { ActionSheetController, ScrollCustomEvent } from "@ionic/angular";
import { EVENT_FINISHED_READING } from "../constants";
import { TextSelectEventDirective } from "./text-select-event.directive";
import { ReadingDbService } from "../services/readingdb.service";
import { Events } from "../services/events.service";
import { AngularFireAnalytics } from "@angular/fire/compat/analytics";
import { DateTime } from "luxon";
import { Subscription } from "rxjs";

@Component({
    selector: "app-today",
    templateUrl: "./today.page.html",
    styleUrls: ["./today.page.scss"],
    standalone: false
})
export class TodayPage implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild("content", { static: true }) content!: any;
  @ViewChild("articleContent", { static: true }) articleContent!: ElementRef;
  yesterday!: string;
  tomorrow!: string;
  day!: string;
  title!: string;
  header!: string;
  html!: string;
  private rawHtml = "";
  isFavorite: boolean = false;
  progress = 0;
  notes: string[] = [];
  private sub!: Subscription;
  private dbSub: Subscription | null = null;
  private clientHeight = 0;
  private markAsRead: boolean = false;
  private destroyed = false;

  constructor(
    private route: ActivatedRoute,
    private material: MaterialService,
    private events: Events,
    private analytics: AngularFireAnalytics,
    private actionSheetController: ActionSheetController,
    private db: ReadingDbService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params) => {
      this.day = params["day"];
      if (this.day === null || this.day === undefined) {
        this.day = DateTime.now().toFormat("MM-dd");
      }
      this.refreshView();
    });
  }

  ionViewDidEnter() {
    this.clientHeight = this.content.el.clientHeight;
    this.progress =
      this.clientHeight / this.articleContent.nativeElement.offsetHeight;
  }

  onPageScroll(event: ScrollCustomEvent) {
    this.progress =
      (event.detail.scrollTop + this.clientHeight) /
      this.articleContent.nativeElement.offsetHeight;
    if (this.progress >= 1 && !this.markAsRead) {
      this.markAsRead = true;
      this.events.publish(EVENT_FINISHED_READING, this.day);
    }
  }

  public async textSelected(event: TextSelectEventDirective) {
    if (event.text.trim() === "") {
      return;
    }
    const actionSheet = await this.actionSheetController.create({
      header: "Highlighted text",
      buttons: [
        {
          text: "Note text",
          icon: "bookmarks",
          handler: () => {
            this.db.highlightText(this.day, event.text);
          },
        },
        {
          text: "Cancel",
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    await actionSheet.present();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.sub.unsubscribe();
    this.dbSub?.unsubscribe();
  }

  // Content and Firestore values are assigned in async callbacks (material.ready()
  // and valueChanges()). On a freshly-created page (e.g. navigating in from the
  // month calendar) those microtasks can resolve during Ionic's enter transition,
  // when Angular's zone-driven change detection doesn't re-check the newly attached
  // view — so the reading text never appears until an in-place update (prev/next)
  // forces a re-render. Force a local CD pass after each async assignment.
  private renderNow() {
    if (this.destroyed) {
      return;
    }
    this.cdr.detectChanges();
  }

  calcDay(numberOfDays: number) {
    const date = DateTime.fromFormat("2015-" + this.day, "yyyy-MM-dd").plus({
      days: numberOfDays,
    });
    this.day = date.toFormat("MM-dd");
    this.refreshView();
  }

  toggleFavorite() {
    this.db.toggleFavorite(this.day);
  }

  highlightedHtml(text: string, searchStrs: string[]): string {
    if (!text || !searchStrs || searchStrs.length === 0) {
      return text;
    }
    try {
      text = text.replace(/(\r\n|\n|\r)/gm, " ");
      searchStrs.forEach((query) => {
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        text = text.replace(regex, (match) => {
          const safe = match
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
          return `<span class="highlight">${safe}</span>`;
        });
      });
    } catch (exception) {
      console.error("error in highlight:", exception);
    }
    return text;
  }

  private refreshView() {
    this.markAsRead = false;
    this.analytics.setCurrentScreen(`day-${this.day}`);
    const today = DateTime.fromFormat("2015-" + this.day, "yyyy-MM-dd");
    this.title = today.toFormat("MMMM dd");
    this.yesterday = today.minus({ days: 1 }).toFormat("MMMM dd");
    this.tomorrow = today.plus({ days: 1 }).toFormat("MMMM dd");
    const split = this.day.split("-");
    const month: string = split[0];
    this.dbSub?.unsubscribe();
    this.dbSub = null;
    this.material.ready().then((json) => {
      const dayData = json[month].find((item: any) => item.day === split[1]);
      this.header = dayData["title"];
      this.rawHtml = dayData["content"];
      this.html = this.rawHtml;
      this.renderNow();
      this.content?.scrollToTop();
      this.dbSub = this.db.userDocValue().subscribe((val) => {
        if (!val) return;
        this.isFavorite =
          val.favorites !== undefined && val.favorites.indexOf(this.day) !== -1;
        this.notes = (val.notes ?? [])
          .filter((note) => note.day === this.day)
          .map((note) => note.text);
        // Always highlight from the pristine content so spans never nest on re-emission.
        this.html = this.highlightedHtml(this.rawHtml, this.notes);
        this.renderNow();
      });
    });
  }
}
