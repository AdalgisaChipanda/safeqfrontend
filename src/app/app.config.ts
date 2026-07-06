import 'zone.js'
import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
    // Habilita a detecção de mudanças nativa para componentes standalone
    provideZoneChangeDetection({ eventCoalescing: true,   }),
    
    // Injeta os caminhos de navegação do ecossistema SAFEQ
    provideRouter(routes),
    
    // Configura o cliente HTTP com a moderna Fetch 
    provideHttpClient(withFetch()),

    // CONFIGURAÇÃO ADICIONADA
    { provide: LOCALE_ID, useValue: 'pt-AO' }
  ]
};
