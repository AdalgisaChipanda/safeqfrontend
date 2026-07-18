import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-relatorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-relatorio.component.html'
})
export class TabelaRelatorioComponent {
  @Input() lancamentos: any[] = [];
  @Input() usuarioPerfil: string = '';

  @Output() onEditar = new EventEmitter<any>();
  @Output() onExcluir = new EventEmitter<any>();
}
