import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-lancamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-lancamento.component.html'
})
export class FormLancamentoComponent {
  @Input() tipoLancamento: 'receita' | 'despesa' = 'receita';
  @Input() transacao: any = {};
  @Input() categorias: any[] = [];
  @Input() formasPagamento: any[] = [];
  @Input() carregando: boolean = false;
  @Input() isEdicao: boolean = false; 

  @Output() onMudarTipo = new EventEmitter<'receita' | 'despesa'>();
  @Output() onSalvar = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  mudarAba(tipo: 'receita' | 'despesa'): void {
    this.tipoLancamento = tipo;
    this.onMudarTipo.emit(tipo);
  }

  cancelar(): void {
    this.onCancelar.emit();
  }

  submit(): void {
    this.onSalvar.emit();
  }
}
