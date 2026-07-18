import 'zone.js'; 
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { registerLocaleData } from '@angular/common';
import localePtAo from '@angular/common/locales/pt-AO';

registerLocaleData(localePtAo, 'pt-AO');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
