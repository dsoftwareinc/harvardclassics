import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {SignupPage} from './signup.page';
import {AngularFireModule} from "@angular/fire";
import {environment} from "../../../environments/environment";

const routes: Routes = [
    {
        path: '',
        component: SignupPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        AngularFireModule.initializeApp(environment.firebase),
    ],
    declarations: [SignupPage]
})
export class SignupPageModule {
}
