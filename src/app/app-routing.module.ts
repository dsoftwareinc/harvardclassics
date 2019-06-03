import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'today', pathMatch: 'full'},
    {path: 'today', loadChildren: './today/today.module#TodayPageModule'},
    {path: 'day/:day', loadChildren: './today/today.module#TodayPageModule'},
    {path: 'month/:month', loadChildren: './month/month.module#MonthPageModule'},
    {path: 'about', loadChildren: './about/about.module#AboutPageModule'},
    {path: 'login', loadChildren: './auth/login/login.module#LoginPageModule'},
    {path: 'signup', loadChildren: './auth/signup/signup.module#SignupPageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
