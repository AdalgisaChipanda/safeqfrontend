import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro-relatorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-relatorio.component.html'
})
export class FiltroRelatorioComponent {
  @Input() tipoDemonstrativo!: string;
  @Input() dataInicial!: string;
  @Input() dataFinal!: string;
  @Input() paginaAtual: number = 1;
  @Input() totalPaginas: number = 1;
  @Input() totalRegistos: number = 0; 

  @Output() tipoDemonstrativoChange = new EventEmitter<string>();
  @Output() dataInicialChange = new EventEmitter<string>();
  @Output() dataFinalChange = new EventEmitter<string>();
  @Output() onMudarPagina = new EventEmitter<number>();

  @Output() onFiltrar = new EventEmitter<void>();
  @Output() onExcel = new EventEmitter<void>();
  @Output() onPdf = new EventEmitter<void>();

  atualizarFiltros(): void {
    this.tipoDemonstrativoChange.emit(this.tipoDemonstrativo);
    this.dataInicialChange.emit(this.dataInicial);
    this.dataFinalChange.emit(this.dataFinal);
    this.onFiltrar.emit();
  }
}
