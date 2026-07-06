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
  encapsulation: ViewEncapsulation.None
})
export class CategoriasComponent implements OnInit {
  // --- ESTADOS DE UI ---
  tipoCategoria: 'receita' | 'despesa' | 'ambos' = 'ambos';
  formularioVisivel: boolean = true;
  carregando: boolean = false;         // Para o botão de Guardar
  carregandoTabela: boolean = false;   // Para a lista de categorias

  // --- DADOS ---
  categoriaForm = { nome: '', tipo: 'ambos' };
  categorias: any[] = [];
  
  // --- PAGINAÇÃO ---
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistros: number = 0;

  // --- CONTROLE DE MODAIS ---
  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  itemParaEditar: any = null;
  idParaExcluir: number | null = null;

  // --- FEEDBACK ---
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  // --- SESSÃO ---
  usuarioNome: string = 'Administrador';
  usuarioPerfil: string = 'ADMIN';
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

  // --- CARREGAMENTO DE DADOS ---
carregarCategorias(): void {
  this.carregandoTabela = true;
  this.categoriaService.listar().subscribe({
    next: (res: any) => {
      // ORDENAÇÃO: 
      const dados = res.dados || [];
      this.categorias = dados.sort((a: any, b: any) => b.id - a.id);
      
      this.totalRegistros = this.categorias.length;
      this.totalPaginas = Math.ceil(this.totalRegistros / 10) || 1;
      this.carregandoTabela = false;
      this.cdr.detectChanges();
    }
  });
}

  // --- OPERAÇÕES CRUD ---

criarCategoria(): void {
  if (!this.categoriaForm.nome || !this.podeOperar) return;

  this.carregando = true; // Ativa spinner do botão
  this.categoriaForm.tipo = this.tipoCategoria;

  this.categoriaService.criar(this.categoriaForm).subscribe({
    next: (res) => {
      this.mensagemSucesso = 'Categoria registada com sucesso.';
      this.categoriaForm = { nome: '', tipo: 'ambos' };
      this.carregarCategorias(); // Recarrega a lista
      this.carregando = false;   
      this.limparAlertas();
    },
    error: (err) => {
      this.carregando = false;   
      this.mensagemErro = 'Erro ao criar categoria.';
      this.limparAlertas();
    }
  });
}

  salvarEdicao(): void {
    if (!this.itemParaEditar?.nome) return;

    this.categoriaService.atualizar(this.itemParaEditar.id, this.itemParaEditar).subscribe({
      next: (res) => {
        this.mensagemSucesso = res.mensagem || 'Categoria atualizada com sucesso.';
        this.fecharModalEditar();
        this.carregarCategorias();
        this.limparAlertas();
      },
      error: (err) => {
        this.mensagemErro = err.error?.mensagem || 'Erro ao atualizar dados.';
        this.limparAlertas();
      }
    });
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;

    this.categoriaService.eliminar(this.idParaExcluir).subscribe({
      next: (res) => {
        this.mensagemSucesso = res.mensagem || 'Categoria eliminada com sucesso.';
        this.fecharModalExcluir();
        this.carregarCategorias();
        this.limparAlertas();
      },
      error: () => {
        this.mensagemErro = 'Não é possível eliminar esta categoria.';
        this.fecharModalExcluir();
        this.limparAlertas();
      }
    });
  }

  // --- CONTROLE DE MODAIS ---
  abrirModalEditar(item: any): void {
    if (!this.podeOperar) return;
    this.itemParaEditar = { ...item };
    this.mostrarModalEditar = true;
    this.cdr.detectChanges();
  }

  fecharModalEditar(): void {
    this.mostrarModalEditar = false;
    this.itemParaEditar = null;
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

  // --- AUXILIARES E NAVEGAÇÃO ---
  mudarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
    
    }
  }

  mudarAbaTipo(tipo: 'receita' | 'despesa' | 'ambos'): void {
    if (!this.podeOperar) return;
    this.tipoCategoria = tipo;
  }

  alternarVisibilidadeFormulario(): void {
    this.formularioVisivel = !this.formularioVisivel;
    this.cdr.detectChanges();
  }

  private capturarPermissoes(): void {
    const dadosSessao = localStorage.getItem('safeq_user');
    if (dadosSessao) {
      const user = JSON.parse(dadosSessao);
      this.usuarioPerfil = user.role;
      this.usuarioNome = user.nome;
      if (this.usuarioPerfil === 'diretor') this.podeOperar = false;
    }
  }

  private limparAlertas(): void {
    setTimeout(() => {
      this.mensagemSucesso = '';
      this.mensagemErro = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  navegarParaUsuarios(): void { this.router.navigate(['/usuarios']); }
  terminarSessao(): void {
    localStorage.clear();
    this.router.navigate(['/']); 
  }
}