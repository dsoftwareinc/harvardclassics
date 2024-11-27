import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import 'hammerjs';
import {ReadingDbService} from './services/readingdb.service';

export const MONTHS = ['January',
    'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December'];

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    standalone: false
})
export class AppComponent {
    public appPages = [];

    constructor(private platform: Platform,
                private readDb: ReadingDbService) {
        MONTHS.forEach((month, index) => {
            this.appPages.push({
                title: month,
                url: `/month/${index + 1}`,
                icon: ''
            });
        });
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                console.log('Mobile?');
            }
        });
    }
}
