import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metricas-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metricas-relatorio.component.html'
})
export class MetricasRelatorioComponent {
  @Input() totalReceitas: number = 0;
  @Input() totalDespesas: number = 0;
  @Input() totalResultado: number = 0;
}
