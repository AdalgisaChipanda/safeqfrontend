import 'zone.js';
import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withXsrfConfiguration } from '@angular/common/http'; 
import { routes } from './app.routes';
import localePtAo from '@angular/common/locales/pt-PT'; 
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePtAo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    provideRouter(routes),
    
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',   
        headerName: 'X-XSRF-TOKEN', 
      })
    ),

    { provide: LOCALE_ID, useValue: 'pt-AO' }
  ]
};