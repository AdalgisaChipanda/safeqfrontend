import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { RelatorioService } from '../../services/relatorio.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { FiltroRelatorioComponent } from './components/filtro-relatorio/filtro-relatorio.component';
import { TimbreRelatorioComponent } from './components/timbre-relatorio/timbre-relatorio.component';
import { MetricasRelatorioComponent } from './components/metricas-relatorio/metricas-relatorio.component';
import { TabelaRelatorioComponent } from './components/tabela-relatorio/tabela-relatorio.component';
import { FormLancamentoComponent } from '../receitas/components/form-lancamento/form-lancamento.component';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FiltroRelatorioComponent, TimbreRelatorioComponent, MetricasRelatorioComponent, TabelaRelatorioComponent, FormLancamentoComponent],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class RelatoriosComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';
  carregando: boolean = false;

  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'sucesso' | 'erro' = 'sucesso';

  // FILTROS
  tipoDemonstrativo: string = 'geral';
  dataInicial: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  dataFinal: string = new Date().toISOString().split('T')[0];

  // DADOS
  totais = { receitas: 0, despesas: 0, resultado: 0 };
  todosLancamentos: any[] = [];
  lancamentos: any[] = []; 
  categorias: any[] = [];
  formasPagamento: any[] = [];
  
  usuarioNome: string = '';
  usuarioPerfil: string = '';

  // PAGINAÇÃO E MODAIS
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistos: number = 0;
  private itensPorPagina: number = 11;

  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  itemParaEditar: any = {};

  constructor(private relatorioService: RelatorioService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('safeq_user') || '{}');
    this.usuarioPerfil = user.role;
    this.usuarioNome = user.nome || 'Administrador';
    
    this.carregarParametrosIniciais();
    this.carregarRelatorioReal();
  }

  // MÉTODO DE NOTIFICAÇÃO 
  private notify(msg: string, type: 'sucesso' | 'erro') {
    this.mensagemToast = msg;
    this.tipoToast = type;
    this.exibirToast = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.exibirToast = false; this.cdr.detectChanges(); }, 4000);
  }

  carregarRelatorioReal(): void {
    this.carregando = true;
    this.cdr.detectChanges();
    this.relatorioService.obterDadosAnaliticos(this.tipoDemonstrativo, this.dataInicial, this.dataFinal).subscribe({
      next: (res: any) => {
        if (res?.dados) {
          this.todosLancamentos = res.dados.lancamentos || [];
          this.totalRegistos = this.todosLancamentos.length;
          this.totalPaginas = Math.ceil(this.totalRegistos / this.itensPorPagina) || 1;
          this.paginaAtual = 1;
          this.totais.receitas = res.dados.total_receitas;
          this.totais.despesas = res.dados.total_despesas;
          this.totais.resultado = this.totais.receitas - this.totais.despesas;
          this.fatiarLancamentos();
        }
        this.carregando = false;
        this.cdr.detectChanges(); 
      },
      error: () => { 
        this.notify('Erro ao sincronizar dados com o servidor.', 'erro'); 
        this.carregando = false; 
        this.cdr.detectChanges();
      }
    });
  }

  private fatiarLancamentos(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.lancamentos = this.todosLancamentos.slice(inicio, fim);
    this.cdr.detectChanges();
  }

  mudarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
      this.fatiarLancamentos();
    }
  }

  // OPERAÇÕES DE MODAIS
  abrirModalEditar(item: any) {
    this.itemParaEditar = JSON.parse(JSON.stringify(item));
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

  salvarEdicao(): void {
    this.carregando = true;
    const endpoint = this.itemParaEditar.tipo === 'receita' ? 'receitas' : 'despesas';
    this.http.put(`${this.apiUrl}/${endpoint}/${this.itemParaEditar.id}`, this.itemParaEditar, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.notify('Registro financeiro atualizado!', 'sucesso');
        this.fecharModalEditar();
        this.carregarRelatorioReal();
      },
      error: () => { 
        this.carregando = false; 
        this.notify('Não foi possível salvar as alterações.', 'erro'); 
        this.cdr.detectChanges(); 
      }
    });
  }

  confirmarExclusao(): void {
    const endpoint = this.itemParaEditar.tipo === 'receita' ? 'receitas' : 'despesas';
    this.http.delete(`${this.apiUrl}/${endpoint}/${this.itemParaEditar.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.notify('Lançamento removido com sucesso!', 'sucesso');
        this.fecharModalExcluir();
        this.carregarRelatorioReal();
      },
      error: () => { this.notify('Erro ao tentar excluir o registro.', 'erro'); this.cdr.detectChanges(); }
    });
  }

  // --- EXPORTAÇÕES  ---
  exportarExcel(): void {
    this.baixarArquivo(`${this.apiUrl}/relatorios/exportar-excel`, `safeq_relatorio_${Date.now()}.xls`);
  }

  imprimirPDF(): void {
    this.baixarArquivo(`${this.apiUrl}/relatorios/exportar-pdf`, `safeq_relatorio_${Date.now()}.pdf`);
  }

private baixarArquivo(url: string, nome: string) {
    this.carregando = true;
    this.notify('A processar documento...', 'sucesso');
    
    const params = new HttpParams()
      .set('tipo', this.tipoDemonstrativo)
      .set('data_inicio', this.dataInicial)
      .set('data_fim', this.dataFinal);

    this.http.get(url, { headers: this.getHeaders(), params, responseType: 'blob' }).subscribe({
      next: (res: Blob) => {
        if (res.size < 200) { 
           // Se o arquivo for minúsculo, o Laravel enviou um erro JSON dentro do Blob
           this.notify('O servidor enviou um ficheiro inválido.', 'erro');
           this.carregando = false;
           return;
        }

        const blob = new Blob([res], { type: res.type });
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = nome;
        
        document.body.appendChild(link);
        link.click();
        
        // Limpeza
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);
        
        this.carregando = false;
        this.notify('Documento descarregado!', 'sucesso');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro de download:', err);
        this.carregando = false;
        this.notify('Erro 500: O servidor falhou ao gerar o ficheiro.', 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  private carregarParametrosIniciais(): void {
    const headers = this.getHeaders();
    this.http.get(`${this.apiUrl}/categorias`, { headers }).subscribe((res: any) => this.categorias = res.dados || []);
    this.http.get(`${this.apiUrl}/formas-pagamento`, { headers }).subscribe((res: any) => this.formasPagamento = res.dados || []);
  }

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('safeq_token')}` });
  }
}
