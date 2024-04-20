import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app-module/app-module.module';

//bootstrapApplication(AppComponent, appConfig)
  //.catch((err) => console.error(err));

platformBrowserDynamic().bootstrapModule(AppModule);