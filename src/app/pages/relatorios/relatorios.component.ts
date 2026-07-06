import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { RelatorioService } from '../../services/relatorio.service';

import { FiltroRelatorioComponent } from './components/filtro-relatorio/filtro-relatorio.component';
import { TimbreRelatorioComponent } from './components/timbre-relatorio/timbre-relatorio.component';
import { MetricasRelatorioComponent } from './components/metricas-relatorio/metricas-relatorio.component';
import { TabelaRelatorioComponent } from './components/tabela-relatorio/tabela-relatorio.component';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FiltroRelatorioComponent, 
    TimbreRelatorioComponent, MetricasRelatorioComponent, TabelaRelatorioComponent
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RelatoriosComponent implements OnInit {
  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  tipoDemonstrativo: string = 'geral';
  dataInicial: string = '2026-01-01';
  dataFinal: string = '2026-06-30';

  totais = { receitas: 0, despesas: 0, resultado: 0 };
  lancamentos: any[] = [];
  usuarioNome: string = 'Administrador';
  usuarioPerfil: string = 'AUDITOR';

  constructor(
    private relatorioService: RelatorioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.capturarSessao();
    this.carregarRelatorioReal();
  }

  private capturarSessao(): void {
    const dados = localStorage.getItem('safeq_user');
    if (dados) {
      const user = JSON.parse(dados);
      this.usuarioPerfil = user.role;
      this.usuarioNome = user.nome || 'Administrador';
    }
  }

  carregarRelatorioReal(): void {
    this.carregando = true;
    this.relatorioService.obterDadosAnaliticos(this.tipoDemonstrativo, this.dataInicial, this.dataFinal).subscribe({
      next: (res: any) => {
        if (res?.dados) {
          this.lancamentos = res.dados.lancamentos || [];
          this.totais.receitas = parseFloat(res.dados.total_receitas) || 0;
          this.totais.despesas = parseFloat(res.dados.total_despesas) || 0;
          this.totais.resultado = this.totais.receitas - this.totais.despesas;
        }
        this.carregando = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.mensagemErro = 'Erro ao carregar dados.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportarExcel(): void {
    this.carregando = true;
    this.relatorioService.exportarExcel(this.tipoDemonstrativo, this.dataInicial, this.dataFinal).subscribe({
      next: (blob: Blob) => {
        const timestamp = new Date().getTime();
        const nomeArquivo = `relatorio_safeq_${timestamp}.xls`;
        this.descarregarArquivo(blob, nomeArquivo, 'application/vnd.ms-excel');
        this.mensagemSucesso = 'Excel descarregado com sucesso!';
        this.carregando = false;
        this.limparAlertas();
      },
      error: () => {
        this.mensagemErro = 'Falha ao gerar Excel.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  imprimirPDF(): void {
    this.carregando = true;
    this.relatorioService.exportarPdf(this.tipoDemonstrativo, this.dataInicial, this.dataFinal).subscribe({
      next: (blob: Blob) => {
        const timestamp = new Date().getTime();
        const nomeArquivo = `relatorio_safeq_${timestamp}.pdf`;
        this.descarregarArquivo(blob, nomeArquivo, 'application/pdf');
        this.mensagemSucesso = 'PDF descarregado com sucesso!';
        this.carregando = false;
        this.limparAlertas();
      },
      error: () => {
        this.mensagemErro = 'Falha ao gerar PDF.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * FUNÇÃO MESTRE DE DOWNLOAD: Resolve o problema de não baixar no PC
   */
  private descarregarArquivo(blob: Blob, nome: string, tipo: string): void {
    const novoBlob = new Blob([blob], { type: tipo });
    const url = window.URL.createObjectURL(novoBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    
    // Obrigatório para navegadores modernos:
    document.body.appendChild(link);
    link.click();
    
    // Limpeza:
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    this.cdr.detectChanges();
  }

  private limparAlertas(): void {
    setTimeout(() => { this.mensagemSucesso = ''; this.mensagemErro = ''; this.cdr.detectChanges(); }, 3000);
  }
}