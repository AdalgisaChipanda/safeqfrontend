import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timbre-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timbre-relatorio.component.html'
})
export class TimbreRelatorioComponent {
  @Input() usuarioPerfil!: string;
  @Input() usuarioNome!: string;
  @Input() dataInicial!: string;
  @Input() dataFinal!: string;
}
