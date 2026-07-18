import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CategoriasComponent implements OnInit {
  // --- DADOS E LISTAGENS ---
  categories: any[] = [];
  todasCategorias: any[] = [];
  categoriaForm = { nome: '', tipo: 'ambos' };
  itemParaEditar: any = { id: null, nome: '', tipo: 'ambos' };

  // --- ESTADOS DE UI ---
  tipoCategoria: 'receita' | 'despesa' | 'ambos' = 'ambos';
  formularioVisivel: boolean = true;
  carregando: boolean = false;
  carregandoTabela: boolean = false;

  // --- PAGINAÇÃO ERP ---
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistros: number = 0;
  private itensPorPagina: number = 11;

  // --- CONTROLE DE MODAIS ---
  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  idParaExcluir: number | null = null;

  // --- SISTEMA DE NOTIFICAÇÃO ---
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'sucesso' | 'erro' = 'sucesso';

  // --- SESSÃO E SEGURANÇA ---
  usuarioPerfil: string = '';
  podeOperar: boolean = true;

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.capturarPermissoes();
    this.carregarCategorias();
  }

  // --- BLINDAGEM DE NOTIFICAÇÃO ---
  private notify(msg: string, type: 'sucesso' | 'erro') {
    this.mensagemToast = msg;
    this.tipoToast = type;
    this.exibirToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.exibirToast = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  // --- CARREGAMENTO DE DADOS ---
  carregarCategorias(): void {
    this.carregandoTabela = true;
    this.categoriaService.listar().subscribe({
      next: (res: any) => {
        // Ordena os registros (Mais novos primeiro)
        this.todasCategorias = (res.dados || []).sort((a: any, b: any) => b.id - a.id);
        this.totalRegistros = this.todasCategorias.length;
        this.totalPaginas = Math.ceil(this.totalRegistros / this.itensPorPagina) || 1;
        
        this.fatiarExibicao();
        this.carregandoTabela = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notify('O servidor não respondeu. Verifique sua conexão.', 'erro');
        this.carregandoTabela = false;
        this.cdr.detectChanges();
      }
    });
  }

  private fatiarExibicao(): void {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.categories = this.todasCategorias.slice(inicio, fim);
  }

  mudarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
      this.fatiarExibicao();
      this.cdr.detectChanges();
    }
  }

  // --- OPERAÇÕES CRUD (CREATE, UPDATE, DELETE) ---

  criarCategoria(): void {
    if (!this.categoriaForm.nome || !this.podeOperar) return;
    this.carregando = true;
    this.categoriaForm.tipo = this.tipoCategoria;

    this.categoriaService.criar(this.categoriaForm).subscribe({
      next: () => {
        this.notify('Categoria registada com sucesso!', 'sucesso');
        this.categoriaForm = { nome: '', tipo: 'ambos' };
        this.paginaAtual = 1;
        this.carregarCategorias();
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        let msg = 'Erro ao processar o registo.';
        
        if (err.status === 422 && err.error.errors) {
          const listaErros: any = err.error.errors;
          const mensagens: any = Object.values(listaErros);
          msg = mensagens[0][0];
        }
        this.notify(msg, 'erro');
      }
    });
  }

  salvarEdicao(): void {
    if (!this.itemParaEditar?.nome) return;
    this.carregando = true;

    this.categoriaService.atualizar(this.itemParaEditar.id, this.itemParaEditar).subscribe({
      next: () => {
        this.notify('Alterações guardadas com sucesso!', 'sucesso');
        this.fecharModalEditar();
        this.carregarCategorias();
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        let msg = 'Falha na atualização dos dados.';
        
        if (err.status === 422 && err.error.errors) {
          const listaErros: any = err.error.errors;
          const mensagens: any = Object.values(listaErros);
          msg = mensagens[0][0];
        } else if (err.status === 403) {
          msg = 'Você não tem permissão para editar categorias.';
        }
        
        this.notify(msg, 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;

    this.categoriaService.eliminar(this.idParaExcluir).subscribe({
      next: () => {
        this.notify('Categoria removida permanentemente.', 'sucesso');
        this.fecharModalExcluir();
        this.carregarCategorias();
      },
      error: (err) => {
        this.fecharModalExcluir();
        const msg = err.error?.mensagem || 'Não é possível eliminar categorias em uso.';
        this.notify(msg, 'erro');
      }
    });
  }

  // --- CONTROLES DE MODAIS ---

  abrirModalEditar(item: any): void {
    if (!this.podeOperar) return;
    this.itemParaEditar = { ...item };
    this.mostrarModalEditar = true;
    this.cdr.detectChanges();
  }

  fecharModalEditar(): void {
    this.mostrarModalEditar = false;
    this.cdr.detectChanges();
  }

  abrirModalExcluir(id: number): void {
    if (!this.podeOperar) return;
    this.idParaExcluir = id;
    this.mostrarModalExcluir = true;
    this.cdr.detectChanges();
  }

  fecharModalExcluir(): void {
    this.mostrarModalExcluir = false;
    this.idParaExcluir = null;
    this.cdr.detectChanges();
  }

  mudarAbaTipo(tipo: 'receita' | 'despesa' | 'ambos'): void {
    if (!this.podeOperar) return;
    this.tipoCategoria = tipo;
    this.cdr.detectChanges();
  }

  // --- AUXILIARES DE SESSÃO ---

  private capturarPermissoes(): void {
    const dadosSessao = localStorage.getItem('safeq_user');
    if (dadosSessao) {
      const user = JSON.parse(dadosSessao);
      this.usuarioPerfil = user.role;
      if (this.usuarioPerfil === 'diretor') this.podeOperar = false;
    }
  }

  terminarSessao(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}