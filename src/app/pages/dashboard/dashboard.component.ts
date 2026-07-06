import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart') barChartCanvas!: ElementRef;
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;

  private graficoEvolucao!: Chart;
  private graficoCategorias!: Chart;
  private animLoop: any;
  
  private cores = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#6366f1'];
  
  secoesVisiveis: any = { 
    evolucao: true, categorias: true, fontesReceita: true, fontesDespesa: true, meiosPagamento: true 
  };

  kpis: any = { receita_total: 0, despesa_total: 0, lucro_liquido: 0, margem_rentabilidade: '0%' };
  anos: number[] = [];
  fontesReceita: any[] = [];
  fontesDespesa: any[] = [];
  meiosPagamento: any[] = [];
  meses = [{id:1, nome:'Jan'}, {id:2, nome:'Fev'}, {id:3, nome:'Mar'}, {id:4, nome:'Abr'}, {id:5, nome:'Mai'}, {id:6, nome:'Jun'}, {id:7, nome:'Jul'}, {id:8, nome:'Ago'}, {id:9, nome:'Set'}, {id:10, nome:'Out'}, {id:11, nome:'Nov'}, {id:12, nome:'Dez'}];
  
  anoSelecionado = new Date().getFullYear().toString();
  mesSelecionado = '';

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.inicializarGraficos();
    this.carregarDadosApi();
    this.iniciarSequenciaAnimacao();
  }

  ngOnDestroy(): void {
    if (this.animLoop) clearInterval(this.animLoop);
    if (this.graficoEvolucao) this.graficoEvolucao.destroy();
    if (this.graficoCategorias) this.graficoCategorias.destroy();
  }

  private inicializarGraficos(): void {
    if (this.barChartCanvas) {
      this.graficoEvolucao = new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar',
        data: { labels: [], datasets: [
          { label: 'Receitas', data: [], backgroundColor: '#22c55e', borderRadius: 4, minBarLength: 12 },
          { label: 'Despesas', data: [], backgroundColor: '#ef4444', borderRadius: 4, minBarLength: 12 }
        ]},
        options: {
          responsive: true, maintainAspectRatio: false,
          // ALTERAÇÃO PARA TOQUE INDIVIDUAL:
          interaction: {
            mode: 'point', // Detecta apenas o ponto exato onde você toca
            intersect: true, // Só mostra se encostar na barra
          },
          scales: {
            y: { 
              type: 'logarithmic', min: 1,
              ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } },
              grid: { color: 'rgba(255,255,255,0.05)' }
            },
            x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } }, grid: { display: false } }
          },
          plugins: {
            legend: { labels: { color: 'white', font: { size: 10 } } },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              padding: 10,
              displayColors: false, // Opcional: remove o quadradinho de cor para ficar mais limpo
              callbacks: {
                label: (context: any) => {
                  let val = context.parsed.y;
                  return `${context.dataset.label}: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)}`;
                }
              }
            }
          }
        }
      });
    }

    this.graficoCategorias = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: this.cores, borderWidth: 0 }] },
      options: { 
        responsive: true, maintainAspectRatio: false, cutout: '55%',
        plugins: { legend: { position: 'right', labels: { color: 'white', font: { size: 8 }, boxWidth: 6 } } }
      }
    });
  }

  private iniciarSequenciaAnimacao(): void {
    let tick = 0, pulsos = 0, fase = 'pulsar', angulo = 0;
    this.animLoop = setInterval(() => {
      if (!this.graficoCategorias || !this.secoesVisiveis.categorias) return;
      if (fase === 'pulsar') {
        tick += 0.15;
        (this.graficoCategorias.options as any).cutout = `${55 + (Math.sin(tick) * 3.5)}%`;
        if (tick >= Math.PI * 2) { tick = 0; pulsos++; if (pulsos >= 6) fase = 'girar'; }
      } else {
        angulo += 2.5;
        (this.graficoCategorias.options as any).rotation = angulo;
        if (angulo >= 360) { angulo = 0; pulsos = 0; fase = 'pulsar'; }
      }
      this.graficoCategorias.update('none');
    }, 30);
  }

  carregarDadosApi() {
    this.dashboardService.obterDados(this.anoSelecionado, this.mesSelecionado).subscribe({
      next: (res: any) => {
        if (res?.dados) {
          this.kpis = res.dados.kpis;
          this.fontesReceita = res.dados.resumos.fontes_receita;
          this.fontesDespesa = res.dados.resumos.fontes_despesa;
          this.meiosPagamento = res.dados.resumos.meios_pagamento;
          this.anos = res.dados.anos_disponiveis;
          this.atualizarGraficos(res.dados.graficos);
          this.cdr.detectChanges();
        }
      }
    });
  }

  private atualizarGraficos(dados: any) {
    if (this.graficoEvolucao && dados.evolucao) {
      this.graficoEvolucao.data.labels = dados.evolucao.labels;
      this.graficoEvolucao.data.datasets[0].data = dados.evolucao.receitas;
      this.graficoEvolucao.data.datasets[1].data = dados.evolucao.despesas;
      this.graficoEvolucao.update();
    }
    if (this.graficoCategorias && dados.categorias) {
      this.graficoCategorias.data.labels = dados.categorias.nomes;
      this.graficoCategorias.data.datasets[0].data = dados.categorias.valores;
      this.graficoCategorias.update();
    }
  }

  fecharSecao(s: string) { 
    this.secoesVisiveis[s] = false; 
    this.cdr.detectChanges(); 
    setTimeout(() => { this.graficoEvolucao?.resize(); this.graficoCategorias?.resize(); }, 100); 
  }

  temSecoesOcultas() { return Object.values(this.secoesVisiveis).some(v => v === false); }
  restaurarSecoes() { Object.keys(this.secoesVisiveis).forEach(k => this.secoesVisiveis[k] = true); this.carregarDadosApi(); }
  onAnoChange(e: any) { this.anoSelecionado = e.target.value; this.carregarDadosApi(); }
  onMesChange(e: any) { this.mesSelecionado = e.target.value; this.carregarDadosApi(); }
}