import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'today',
        pathMatch: 'full'
    },
    {
        path: 'today',
        loadChildren: './today/today.module#TodayPageModule'
    },
    {
        path: 'day/:day',
        loadChildren: './today/today.module#TodayPageModule'
    },
    {
        path: 'month/:month',
        loadChildren: './month/month.module#MonthPageModule'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
