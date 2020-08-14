import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';

import {IonicModule} from '@ionic/angular';
import {CalendarModule} from 'ion2-calendar';
import {MonthPage} from './month.page';

const routes: Routes = [
    {
        path: '',
        component: MonthPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CalendarModule,
        RouterModule.forChild(routes),
    ],
    declarations: [MonthPage]
})
export class MonthPageModule {
}
