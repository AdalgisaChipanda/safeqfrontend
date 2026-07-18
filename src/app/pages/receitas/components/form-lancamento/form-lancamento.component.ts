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
  @Input() usuarioPerfil: string = '';

  @Output() onMudarTipo = new EventEmitter<'receita' | 'despesa'>();
  @Output() onSalvar = new EventEmitter<void>();
  @Output() onCancelar = new EventEmitter<void>();

  // SÓ É VALIDO SE TODOS OS CAMPOS ESTIVEREM PREENCHIDOS
  get formularioValido(): boolean {
    return !!(
      this.transacao.valor && 
      this.transacao.data && 
      this.transacao.categoria_id && 
      this.transacao.forma_pagamento_id && 
      this.transacao.fornecedor && 
      this.transacao.descricao
    );
  }

  get podeVerBotao(): boolean {
    if (!this.usuarioPerfil) return true;
    const role = this.usuarioPerfil.toLowerCase().trim();
    return !(role === 'diretor geral' || role === 'diretor');
  }

  mudarAba(tipo: 'receita' | 'despesa'): void {
    this.tipoLancamento = tipo;
    this.onMudarTipo.emit(tipo);
  }

  submit(): void {
    if (this.formularioValido && this.podeVerBotao && !this.carregando) {
      this.onSalvar.emit();
    }
  }
}