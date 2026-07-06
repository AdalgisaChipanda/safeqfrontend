import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-relatorio.component.html',
  styleUrls: ['../../relatorios.component.scss']
})
export class TabelaRelatorioComponent {
  @Input() lancamentos: any[] = [];
}
