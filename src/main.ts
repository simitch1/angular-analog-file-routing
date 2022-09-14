import './polyfills';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { getFileBasedRoutes } from './routes';

if (import.meta.env.PROD) {
  enableProdMode();
}

getFileBasedRoutes()
  .then((routes) =>
    bootstrapApplication(AppComponent, {
      providers: [provideRouter(routes)],
    })
  )
  .catch(console.error);
