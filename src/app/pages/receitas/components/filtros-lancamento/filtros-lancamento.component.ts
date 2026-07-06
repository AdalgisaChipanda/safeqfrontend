import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-lancamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-lancamento.component.html'
})
export class FiltrosLancamentoComponent {
  @Input() categorias: any[] = [];
  @Input() formasPagamento: any[] = [];

  filtros = {
    search: '',
    tipo: 'todos',
    categoria: 'todas',
    meio: 'todos',
    ordenacao: 'recentes',
    data_inicio: '',
    data_fim: ''
  };

  @Output() onSearch = new EventEmitter<any>();
  @Output() onFiltroChange = new EventEmitter<any>();

  pesquisar(event: any) {
    this.onSearch.emit(event);
  }

  notificarMudanca() {
    this.onFiltroChange.emit(this.filtros);
  }

  limparFiltros() {
    this.filtros = {
      search: '',
      tipo: 'todos',
      categoria: 'todas',
      meio: 'todos',
      ordenacao: 'recentes',
      data_inicio: '',
      data_fim: ''
    };
    this.notificarMudanca();
  }
}