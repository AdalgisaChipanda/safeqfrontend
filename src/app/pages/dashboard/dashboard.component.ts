import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardRefreshService } from '../../services/dashboard-refresh.service';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [CurrencyPipe]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('barChart') barChartCanvas!: ElementRef;
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;

  private graficoEvolucao: Chart | null = null;
  private graficoCategorias: Chart | null = null;
  
  private animInterval: any;
  private kpiInterval: any;
  private refreshSub!: Subscription;
  
  loading: boolean = true;
  hasData: boolean = false;
  secoesVisiveis: any = { 
    evolucao: true, categorias: true, fontesReceita: true, 
    fontesDespesa: true, meiosPagamento: true, auditoria: true, provisionamento: true 
  };
  
  dadosBrutos: any = null;
  animatedKpis: any = { receita_total: 0, despesa_total: 0, lucro_liquido: 0, margem_rentabilidade: 0 };

  anosDisponiveis: number[] = [];
  mesesLista = [
    {id: 1, nome: 'Janeiro'}, {id: 2, nome: 'Fevereiro'}, {id: 3, nome: 'Março'},
    {id: 4, nome: 'Abril'}, {id: 5, nome: 'Maio'}, {id: 6, nome: 'Junho'},
    {id: 7, nome: 'Julho'}, {id: 8, nome: 'Agosto'}, {id: 9, nome: 'Setembro'},
    {id: 10, nome: 'Outubro'}, {id: 11, nome: 'Novembro'}, {id: 12, nome: 'Dezembro'}
  ];

  anoSelecionado = new Date().getFullYear().toString();
  mesSelecionado = '';

  constructor(
    private dashboardService: DashboardService,
    private refreshService: DashboardRefreshService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDadosApi();
    this.refreshSub = this.refreshService.onRefresh.subscribe(() => {
      this.carregarDadosApi();
    });
  }

  ngOnDestroy(): void {
    this.limparRecursos();
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  private limparRecursos() {
    if (this.animInterval) clearInterval(this.animInterval);
    if (this.kpiInterval) clearInterval(this.kpiInterval);
    if (this.graficoEvolucao) { this.graficoEvolucao.destroy(); this.graficoEvolucao = null; }
    if (this.graficoCategorias) { this.graficoCategorias.destroy(); this.graficoCategorias = null; }
  }

  carregarDadosApi() {
    this.loading = true;
    this.limparRecursos();

    this.dashboardService.obterDados(this.anoSelecionado, this.mesSelecionado).subscribe({
      next: (res: any) => {
        if (res && res.dados) {
          this.dadosBrutos = res.dados;
          this.anosDisponiveis = res.dados.anos_disponiveis || [new Date().getFullYear()];
          const k = res.dados.kpis;
          this.hasData = (k.receita_total > 0 || k.despesa_total > 0 || res.dados.atividades_recentes?.length > 0);

          if (this.hasData) {
            this.animarKpis(k);
            setTimeout(() => { 
              this.inicializarGraficos(res.dados.graficos);
              this.iniciarAnimacaoCicloCirculo(); 
            }, 100);
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.hasData = false; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  private animarKpis(kpis: any) {
    let step = 0;
    const totalSteps = 40;
    if (this.kpiInterval) clearInterval(this.kpiInterval);
    this.kpiInterval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      this.animatedKpis.receita_total = (kpis.receita_total || 0) * progress;
      this.animatedKpis.despesa_total = (kpis.despesa_total || 0) * progress;
      this.animatedKpis.lucro_liquido = (kpis.lucro_liquido || 0) * progress;
      this.animatedKpis.margem_rentabilidade = ((kpis.margem_rentabilidade || 0) * progress).toFixed(1);
      if (step >= totalSteps) { this.animatedKpis = { ...kpis }; clearInterval(this.kpiInterval); }
      this.cdr.detectChanges();
    }, 20);
    }
    
private inicializarGraficos(dados: any) {
  if (this.barChartCanvas && this.secoesVisiveis.evolucao && dados?.evolucao) {
    if (this.graficoEvolucao) this.graficoEvolucao.destroy();

    /**
     * REGRA DE BI PROFISSIONAL:
     * 1. Se o valor for 0, usamos 'null'. O Chart.js IGNORA o null e não desenha NADA.
     * 2. Isso elimina os "tocos" ou quadradinhos nos meses vazios.
     */
    const receitas = dados.evolucao.receitas.map((v: any) => {
      const n = Number(v);
      return n > 0 ? n : null; 
    });

    const despesas = dados.evolucao.despesas.map((v: any) => {
      const n = Number(v);
      return n > 0 ? n : null;
    });

    this.graficoEvolucao = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: dados.evolucao.labels,
        datasets: [
          { 
            label: 'Receitas', 
            data: receitas, 
            backgroundColor: '#10b981', 
            borderRadius: 4,
            minBarLength: 0 // IMPORTANTE: 0 para não aparecer nada no zero
          },
          { 
            label: 'Despesas', 
            data: despesas, 
            backgroundColor: '#ef4444', 
            borderRadius: 4,
            minBarLength: 0 // IMPORTANTE: 0 para não aparecer nada no zero
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            /**
             * MUDANÇA PARA ESCALA LOGARÍTMICA:
             * É o que permite que o valor de Julho apareça "ALTO" mesmo
             * tendo um valor pequeno perto dos 600k de Março.
             */
            type: 'logarithmic',
            min: 1, // Impede erro de log(0) e ajuda na visualização
            grid: { 
              color: 'rgba(255,255,255,0.05)',
              drawTicks: false 
            }, 
            ticks: { 
              color: '#ffffff',
              font: { size: 10 },
              // Limpa o eixo Y para mostrar apenas números de BI
              callback: function(value) {
                const val = Number(value);
                if (val === 10 || val === 100 || val === 1000 || val === 10000 || val === 100000 || val === 1000000) {
                  return val >= 1000 ? (val / 1000) + 'k' : val;
                }
                return null;
              }
            }
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: '#ffffff', font: { size: 11, weight: 'bold' } } 
          }
        },
        plugins: { 
          legend: { 
            position: 'top',
            labels: { color: '#ffffff', font: { size: 12, weight: 'bold' } } 
          },
          tooltip: {
            backgroundColor: '#1e293b',
            callbacks: {
              label: (context: any) => {
                const val = context.raw;
                if (!val) return ` ${context.dataset.label}: 0 AOA`;
                return ` ${context.dataset.label}: ${Number(val).toLocaleString('pt-AO')} AOA`;
              }
            }
          }
        }
      }
    });
  }

  // Gráfico de Rosca (Mantido conforme anterior)
  if (this.pieChartCanvas && this.secoesVisiveis.categorias && dados?.categorias) {
    if (this.graficoCategorias) this.graficoCategorias.destroy();
    this.graficoCategorias = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: dados.categorias.nomes,
        datasets: [{ data: dados.categorias.valores, backgroundColor: ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#6366f1'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '75%',
        plugins: { legend: { position: 'right', labels: { color: '#ffffff', font: { size: 9 } } } }
      }
    });
  }
}

  private iniciarAnimacaoCicloCirculo() {
    let pulses = 0; let rotations = 0; let tick = 0;
    let phase: 'pulse' | 'rotate' = 'pulse';
    if (this.animInterval) clearInterval(this.animInterval);
    this.animInterval = setInterval(() => {
      if (!this.graficoCategorias) return;
      if (phase === 'pulse') {
        tick += 0.2; (this.graficoCategorias.options as any).cutout = `${75 + Math.sin(tick) * 8}%`;
        if (tick >= Math.PI * 2) { tick = 0; pulses++; if (pulses >= 6) { phase = 'rotate'; pulses = 0; } }
      } else {
        (this.graficoCategorias.options as any).rotation += 5; rotations += 5;
        if (rotations >= 1080) { rotations = 0; phase = 'pulse'; }
      }
      this.graficoCategorias.update('none');
    }, 40);
  }

  onAnoChange(e: any) { this.anoSelecionado = e.target.value; this.carregarDadosApi(); }
  onMesChange(e: any) { this.mesSelecionado = e.target.value; this.carregarDadosApi(); }
  fecharSecao(s: string) { this.secoesVisiveis[s] = false; this.cdr.detectChanges(); }
  restaurarSecoes() { Object.keys(this.secoesVisiveis).forEach(k => this.secoesVisiveis[k] = true); this.carregarDadosApi(); }
}