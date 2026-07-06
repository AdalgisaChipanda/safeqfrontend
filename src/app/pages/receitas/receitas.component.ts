import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { FormLancamentoComponent } from './components/form-lancamento/form-lancamento.component';
import { FiltrosLancamentoComponent } from './components/filtros-lancamento/filtros-lancamento.component';
import { TabelaLancamentoComponent } from './components/tabela-lancamento/tabela-lancamento.component';

@Component({
  selector: 'app-receitas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FormLancamentoComponent, FiltrosLancamentoComponent, TabelaLancamentoComponent],
  templateUrl: './receitas.component.html',
  styleUrls: ['./receitas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReceitasComponent implements OnInit, OnDestroy {
  // Dados do Formulário Novo
  transacao = { valor: null, data: '2026-07-05', categoria_id: '', forma_pagamento_id: '', fornecedor: '', descricao: '' };
  
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;        
  carregandoTabela: boolean = false;  
  
  formularioVisivel: boolean = true;
  tipoLancamento: 'receita' | 'despesa' = 'receita';
  usuarioPerfil: string = '';
  
  // Variáveis dos Modais (RESOLVE O PROBLEMA DE ABRIR E EDITAR)
  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  itemParaEditar: any = {};
  idParaExcluir: number | null = null;
  tipoParaExcluir: string = '';

  historicoFiltrado: any[] = [];
  categorias: any[] = [];
  formasPagamento: any[] = [];
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistos: number = 0;

  filtrosAtivos = { search: '', tipo: 'todos', categoria: 'todas', meio: 'todos', ordenacao: 'recentes', data_inicio: '', data_fim: '' };
  private apiUrl = 'http://localhost:8000/api';
  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.capturarPermissoes();
    this.carregarParametrosIniciais();
    this.carregarHistorico();

    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(texto => {
      this.filtrosAtivos.search = texto;
      this.carregarHistorico();
    });
  }

  ngOnDestroy(): void { this.searchSubject.complete(); }

  // --- CONTROLE DE MODAIS ---
  abrirModalEditar(item: any): void {
    // IMPORTANTE: Preencher os IDs para o formulário de edição reconhecer os Selects
    this.itemParaEditar = { 
      ...item,
      categoria_id: item.categoria?.id || item.categoria_id,
      forma_pagamento_id: item.forma_pagamento?.id || item.forma_pagamento_id
    };
    this.mostrarModalEditar = true;
    this.cdr.detectChanges();
  }

  fecharModalEditar(): void {
    this.mostrarModalEditar = false;
    this.cdr.detectChanges();
  }

  abrirModalExcluir(item: any): void {
    this.idParaExcluir = item.id;
    this.tipoParaExcluir = item.tipo;
    this.mostrarModalExcluir = true;
    this.cdr.detectChanges();
  }

  fecharModalExcluir(): void {
    this.mostrarModalExcluir = false;
    this.cdr.detectChanges();
  }

  // --- MÉTODOS DE API ---
  carregarHistorico(): void {
    const headers = this.obterHeaders();
    this.carregandoTabela = true;
    let params = new HttpParams()
      .set('search', this.filtrosAtivos.search)
      .set('page', this.paginaAtual.toString())
      .set('categoria_id', this.filtrosAtivos.categoria === 'todas' ? '' : this.filtrosAtivos.categoria)
      .set('forma_pagamento_id', this.filtrosAtivos.meio === 'todos' ? '' : this.filtrosAtivos.meio);

    const endpoint = this.filtrosAtivos.tipo === 'todos' ? 'lancamentos' : this.filtrosAtivos.tipo + 's';
    this.http.get(`${this.apiUrl}/${endpoint}`, { headers, params }).subscribe({
      next: (res: any) => {
        this.historicoFiltrado = res.dados.data || [];
        this.paginaAtual = res.dados.current_page || 1;
        this.totalPaginas = res.dados.last_page || 1;
        this.totalRegistos = res.dados.total || 0;
        this.carregandoTabela = false;
        this.cdr.detectChanges();
      },
      error: () => { this.carregandoTabela = false; this.cdr.detectChanges(); }
    });
  }

  //  SALVAR EDIÇÃO 
  salvarEdicao(): void {
    this.carregando = true;
    const endpoint = this.itemParaEditar.tipo === 'receita' ? 'receitas' : 'despesas';
    
    const payload = {
      valor: this.itemParaEditar.valor,
      data: this.itemParaEditar.data,
      fornecedor: this.itemParaEditar.fornecedor,
      descricao: this.itemParaEditar.descricao,
      categoria_id: this.itemParaEditar.categoria_id,
      forma_pagamento_id: this.itemParaEditar.forma_pagamento_id
    };

    this.http.put(`${this.apiUrl}/${endpoint}/${this.itemParaEditar.id}`, payload, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Registo atualizado com sucesso!';
        this.carregando = false;
        this.fecharModalEditar();
        this.carregarHistorico();
        this.limparAlertas();
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = 'Erro ao salvar: Verifique os campos.';
        console.error(err);
        this.limparAlertas();
      }
    });
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;
    const endpoint = this.tipoParaExcluir === 'receita' ? 'receitas' : 'despesas';
    this.http.delete(`${this.apiUrl}/${endpoint}/${this.idParaExcluir}`, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Registo removido!';
        this.fecharModalExcluir();
        this.carregarHistorico();
        this.limparAlertas();
      }
    });
  }

  executarLancamento(): void {
    this.carregando = true;
    const endpoint = this.tipoLancamento === 'receita' ? 'receitas' : 'despesas';
    this.http.post(`${this.apiUrl}/${endpoint}`, this.transacao, { headers: this.obterHeaders() }).subscribe({
      next: () => {
        this.mensagemSucesso = 'Registo guardado!';
        this.carregando = false;
        this.resetarFormulario();
        this.carregarHistorico();
        this.limparAlertas();
      },
      error: () => { this.carregando = false; this.cdr.detectChanges(); }
    });
  }

  // --- AUXILIARES ---
  private carregarParametrosIniciais(): void {
    const headers = this.obterHeaders();
    this.http.get(`${this.apiUrl}/categorias`, { headers }).subscribe((res: any) => this.categorias = res.dados || []);
    this.http.get(`${this.apiUrl}/formas-pagamento`, { headers }).subscribe((res: any) => this.formasPagamento = res.dados || []);
  }

  private obterHeaders(): HttpHeaders { return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('safeq_token')}` }); }
  private resetarFormulario(): void { this.transacao = { valor: null, data: '2026-07-05', categoria_id: '', forma_pagamento_id: '', fornecedor: '', descricao: '' }; }
  private limparAlertas(): void { setTimeout(() => { this.mensagemSucesso = ''; this.mensagemErro = ''; this.cdr.detectChanges(); }, 3500); }
  private capturarPermissoes(): void { const user = JSON.parse(localStorage.getItem('safeq_user') || '{}'); this.usuarioPerfil = user.role; }
  mudarPagina(p: number): void { if (p >= 1 && p <= this.totalPaginas) { this.paginaAtual = p; this.carregarHistorico(); } }
  alternarVisibilidadeFormulario(): void { this.formularioVisivel = !this.formularioVisivel; }
  mudarAbaFormulario(tipo: any): void { this.tipoLancamento = tipo; this.resetarFormulario(); }
  onSearch(texto: any): void { this.searchSubject.next(texto); }
  aplicarFiltrosManuais(filtros: any): void { this.filtrosAtivos = filtros; this.paginaAtual = 1; this.carregarHistorico(); }
}