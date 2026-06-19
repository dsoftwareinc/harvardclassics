import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { initializeApp } from 'firebase/app';
import 'zone.js';

initializeApp(environment.firebase);

if (environment.production) {
  enableProdMode();
}

platformBrowser().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch(err => console.log(err));
