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
  @Input() formasPagamento: any[] = []; // Resolve o erro NG8002
  
  @Output() onSearch = new EventEmitter<any>();
  @Output() onFiltroChange = new EventEmitter<any>();
  @Output() onNovoLancamento = new EventEmitter<void>();

  // Resolve todos os erros TS2339 de falta da propriedade 'filtros'
  filtros = {
    search: '',
    tipo: 'todos',
    categoria: 'todas',
    meio: 'todos',
    ordenacao: 'recentes',
    data_inicio: '',
    data_fim: ''
  };

  pesquisar(event: any) {
    const valor = event.target.value;
    this.onSearch.emit(valor);
  }

  // Resolve o erro TS2339 do método 'notificarMudanca'
  notificarMudanca() {
    this.onFiltroChange.emit(this.filtros);
  }

  // Resolve o erro TS2339 do método 'limparFiltros'
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
