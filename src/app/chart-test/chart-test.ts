import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart-test',
  standalone: true,
  templateUrl: './chart-test.html'
})
export class ChartTestComponent implements AfterViewInit {

  ngAfterViewInit(): void {

    new Chart('testChart', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr'],
        datasets: [
          {
            label: 'Receitas SAFEQ',
            data: [100, 200, 150, 300],
            backgroundColor: 'blue'
          }
        ]
      }
    });

  }

}