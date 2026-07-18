import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FiltrosLancamentoComponent } from './components/filtros-lancamento/filtros-lancamento.component';
import { TabelaLancamentoComponent } from './components/tabela-lancamento/tabela-lancamento.component';
import { FormLancamentoComponent } from './components/form-lancamento/form-lancamento.component';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltrosLancamentoComponent, TabelaLancamentoComponent, FormLancamentoComponent],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.scss']
})
export class ReceitasComponent implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8000/api';
  private searchSubject = new Subject<string>();

  // Dados e Listagens
  transacao: any = { valor: null, data: '', categoria_id: '', forma_pagamento_id: '', fornecedor: '', descricao: '' };
  itemParaEditar: any = {};
  historicoFiltrado: any[] = [];
  categorias: any[] = [];
  formasPagamento: any[] = [];
  
  // UI States
  carregando: boolean = false;
  carregandoTabela: boolean = false;
  tipoLancamento: 'receita' | 'despesa' = 'receita';
  usuarioPerfil: string = '';

  // Toasts
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'sucesso' | 'erro' = 'sucesso';

  // Modais
  mostrarModalCriar: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;

  // Paginação
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistos: number = 0;
  filtrosAtivos = { search: '', tipo: 'todos', categoria: 'todas', ordenacao: 'recentes' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = localStorage.getItem('safeq_user');
    this.usuarioPerfil = user ? JSON.parse(user).role : '';
    this.resetarFormulario();
    this.carregarParametros();
    this.carregarHistorico();

    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(texto => {
      this.filtrosAtivos.search = texto;
      this.paginaAtual = 1;
      this.carregarHistorico();
    });
  }

  ngOnDestroy(): void { this.searchSubject.complete(); }

  private notify(msg: string, type: 'sucesso' | 'erro') {
    this.mensagemToast = msg; this.tipoToast = type; this.exibirToast = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.exibirToast = false; this.cdr.detectChanges(); }, 4000);
  }

  carregarHistorico(): void {
    this.carregandoTabela = true;
    this.cdr.detectChanges();

    // LIMITADOR RIGOROSO
    const params = new HttpParams()
      .set('page', this.paginaAtual.toString())
      .set('per_page', '11')
      .set('search', this.filtrosAtivos.search)
      .set('categoria_id', this.filtrosAtivos.categoria === 'todas' ? '' : this.filtrosAtivos.categoria)
      .set('ordenacao', this.filtrosAtivos.ordenacao);

    const endpoint = this.filtrosAtivos.tipo === 'todos' ? 'lancamentos' : this.filtrosAtivos.tipo + 's';

    this.http.get(`${this.apiUrl}/${endpoint}`, { headers: this.obterHeaders(), params }).subscribe({
      next: (res: any) => {
        if (res.dados) {
          this.historicoFiltrado = res.dados.data || [];
          this.paginaAtual = res.dados.current_page || 1;
          this.totalPaginas = res.dados.last_page || 1;
          this.totalRegistos = res.dados.total || 0;
        }
        this.carregandoTabela = false;
        this.cdr.detectChanges(); 
      },
      error: () => { 
        this.carregandoTabela = false; 
        this.notify('Erro ao sincronizar histórico.', 'erro');
        this.cdr.detectChanges(); 
      }
    });
  }

  mudarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.paginaAtual) {
      return;
    }
    this.paginaAtual = p;
    this.carregarHistorico();
  }

  // --- OPERAÇÕES CRUD ---
  salvarNovoLancamento(): void {
    if (this.carregando) return;
    this.carregando = true;

    const endpoint = this.tipoLancamento === 'receita' ? 'receitas' : 'despesas';
    const payload = { ...this.transacao };
    if (!payload.fornecedor) delete payload.fornecedor;
    if (!payload.descricao) delete payload.descricao;

    this.http.post(`${this.apiUrl}/${endpoint}`, payload, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.carregando = false;
        this.notify('Lançamento guardado com sucesso!', 'sucesso');
        this.fecharModalCriar();
        this.carregarHistorico();
      },
      error: (err) => {
        this.carregando = false;
        let msg = 'Erro no servidor (500).';
        if (err.status === 422 && err.error?.errors) {
          const erros: any = Object.values(err.error.errors);
          msg = erros[0][0];
        }
        this.notify(msg, 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  salvarEdicao(): void {
    this.carregando = true;
    const endpoint = this.itemParaEditar.tipo === 'receita' ? 'receitas' : 'despesas';
    this.http.put(`${this.apiUrl}/${endpoint}/${this.itemParaEditar.id}`, this.itemParaEditar, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.carregando = false;
        this.notify('Registro atualizado com sucesso!', 'sucesso');
        this.fecharModalEditar();
        this.carregarHistorico();
      },
      error: () => { 
        this.carregando = false; 
        this.notify('Erro ao atualizar.', 'erro'); 
        this.cdr.detectChanges(); 
      }
    });
  }

  confirmarExclusao(): void {
    const endpoint = this.itemParaEditar.tipo === 'receita' ? 'receitas' : 'despesas';
    this.http.delete(`${this.apiUrl}/${endpoint}/${this.itemParaEditar.id}`, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.notify('Removido com sucesso!', 'sucesso');
        this.fecharModalExcluir();
        this.carregarHistorico();
      },
      error: () => { 
        this.notify('Erro ao excluir registro.', 'erro'); 
        this.cdr.detectChanges(); 
      }
    });
  }

  // --- MODAIS ---
  abrirModalCriar() { this.resetarFormulario(); this.mostrarModalCriar = true; this.cdr.detectChanges(); }
  fecharModalCriar() { this.mostrarModalCriar = false; this.cdr.detectChanges(); }

  abrirModalEditar(item: any) {
    this.itemParaEditar = JSON.parse(JSON.stringify(item));
    this.itemParaEditar.categoria_id = item.categoria?.id || item.categoria_id;
    this.itemParaEditar.forma_pagamento_id = item.forma_pagamento?.id || item.forma_pagamento_id;
    this.mostrarModalEditar = true;
    this.cdr.detectChanges();
  }
  fecharModalEditar() { this.mostrarModalEditar = false; this.cdr.detectChanges(); }

  abrirModalExcluir(item: any) { 
    this.itemParaEditar = item; 
    this.mostrarModalExcluir = true; 
    this.cdr.detectChanges(); 
  }
  fecharModalExcluir() { this.mostrarModalExcluir = false; this.cdr.detectChanges(); }

  // --- AUXILIARES ---
  onSearch(texto: string) { this.searchSubject.next(texto); }

  aplicarFiltrosManuais(filtros: any) { 
    this.filtrosAtivos = { ...this.filtrosAtivos, ...filtros }; 
    this.paginaAtual = 1; 
    this.carregarHistorico(); 
  }

  private obterHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('safeq_token')}` });
  }

  private carregarParametros() {
    this.http.get(`${this.apiUrl}/categorias`, { headers: this.obterHeaders() }).subscribe((res: any) => this.categorias = res.dados || []);
    this.http.get(`${this.apiUrl}/formas-pagamento`, { headers: this.obterHeaders() }).subscribe((res: any) => this.formasPagamento = res.dados || []);
  }

  private resetarFormulario() {
    this.transacao = { 
      valor: null, 
      data: new Date().toISOString().split('T')[0], 
      categoria_id: '', 
      forma_pagamento_id: '', 
      fornecedor: '', 
      descricao: '' 
    };
  }
}