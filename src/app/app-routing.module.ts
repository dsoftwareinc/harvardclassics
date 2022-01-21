import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'today', pathMatch: 'full'},
    {
        path: 'today',
        loadChildren: () => import('./today/today.module').then(m => m.TodayPageModule)
    },
    {
        path: 'day/:day',
        loadChildren: () => import('./today/today.module').then(m => m.TodayPageModule)
    },
    {
        path: 'month/:month',
        loadChildren: () => import('./month/month.module').then(m => m.MonthPageModule)
    },
    {
        path: 'about',
        loadChildren: () => import('./about/about.module').then(m => m.AboutPageModule)
    },
    {
        path: 'login',
        loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'signup',
        loadChildren: () => import('./auth/signup/signup.module').then(m => m.SignupPageModule)
    },
    {
        path: 'notes',
        loadChildren: () => import('./notes/notes.module').then(m => m.NotesPageModule)
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
