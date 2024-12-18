import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {LoginPage} from './login.page';
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../../../environments/environment";

const routes: Routes = [
    {
        path: '',
        component: LoginPage
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
    declarations: [LoginPage]
})
export class LoginPageModule {
}
