import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TodayPage} from './today.page';
import {TextSelectDirective} from './text-select-event.directive';

const routes: Routes = [
    {
        path: '',
        component: TodayPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        TodayPage,
        TextSelectDirective,
    ],
})
export class TodayPageModule {
}
