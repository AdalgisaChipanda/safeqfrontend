import 'zone.js'; // Garante o controle assíncrono do ecossistema Angular
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// IMPORTAÇÃO OBRIGATÓRIA: Registra os dados regionais para o Kwanza (pt-AO) funcionar offline
import { registerLocaleData } from '@angular/common';
import localePtAo from '@angular/common/locales/pt-AO';

// Ativa o registro do locale no motor do Angular
registerLocaleData(localePtAo, 'pt-AO');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
