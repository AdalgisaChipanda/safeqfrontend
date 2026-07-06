import { Component } from '@angular/core';
import { ChartTestComponent } from './chart-test/chart-test';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChartTestComponent],
  templateUrl: './app.html'
})
export class AppComponent {}