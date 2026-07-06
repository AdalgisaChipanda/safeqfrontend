import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-lancamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-lancamento.component.html'
  
})
export class TabelaLancamentoComponent {
  @Input() historico: any[] = [];
  @Input() usuarioPerfil: string = '';
  @Input() paginaAtual: number = 1;
  @Input() totalPaginas: number = 1;
  @Input() totalRegistos: number = 0;

  @Output() onEditar = new EventEmitter<any>();
  @Output() onExcluir = new EventEmitter<any>();
  @Output() onMudarPagina = new EventEmitter<number>();

  editar(item: any) {
    this.onEditar.emit(item);
  }

  excluir(item: any) {
    this.onExcluir.emit(item);
  }

  mudarPagina(pagina: number) {
    this.onMudarPagina.emit(pagina);
  }
}