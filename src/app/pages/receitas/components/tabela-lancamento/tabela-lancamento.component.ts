import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-lancamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-lancamento.component.html'
})
export class TabelaLancamentoComponent {
  // Entradas de dados vindas do componente pai 
  @Input() historico: any[] = [];
  @Input() usuarioPerfil: string = '';
  @Input() paginaAtual: number = 1;
  @Input() totalPaginas: number = 1;
  @Input() totalRegistos: number = 0;

  // Saídas de eventos para ações e paginação
  @Output() onEditar = new EventEmitter<any>();
  @Output() onExcluir = new EventEmitter<any>();
  @Output() onMudarPagina = new EventEmitter<number>();

  editar(item: any): void {
    this.onEditar.emit(item);
  }

  excluir(item: any): void {
    this.onExcluir.emit(item);
  }

  mudarPagina(pagina: number): void {
    this.onMudarPagina.emit(pagina);
  }
}
