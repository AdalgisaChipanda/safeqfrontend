import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsuariosComponent implements OnInit {
  formularioVisivel: boolean = true;
  carregando: boolean = false;
  carregandoTabela: boolean = false;

  usuarios: any[] = [];
  usuarioForm = { nome: '', email: '', password: '', role: 'gestor' };

  usuarioNome: string = '';
  usuarioPerfil: string = '';

  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  itemParaEditar: any = {};
  idParaExcluir: number | null = null;

  mensagemSucesso: string = '';
  mensagemErro: string = '';

  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistros: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.capturarSessao();
    this.carregarUsuarios();
  }

  capturarSessao(): void {
    const dados = localStorage.getItem('safeq_user');
    if (dados) {
      const user = JSON.parse(dados);
      this.usuarioPerfil = user.role;
      this.usuarioNome = user.nome;
    }
  }

  carregarUsuarios(): void {
    this.carregandoTabela = true;
    this.usuarioService.listar(this.paginaAtual).subscribe({
      next: (res) => {
        const dados = res.dados || [];
        // ✅ ORDENAÇÃO: IDs maiores (mais novos) primeiro
        this.usuarios = dados.sort((a: any, b: any) => b.id - a.id);
        
        if (res.paginacao) {
          this.paginaAtual = res.paginacao.pagina_atual;
          this.totalPaginas = res.paginacao.total_paginas;
          this.totalRegistros = res.paginacao.total_registros;
        } else {
          this.totalRegistros = this.usuarios.length;
        }
        this.carregandoTabela = false;
        this.cdr.detectChanges();
      },
      error: () => { this.carregandoTabela = false; this.cdr.detectChanges(); }
    });
  }

criarUsuario(): void {
  if (!this.usuarioForm.nome || !this.usuarioForm.email || !this.usuarioForm.password) {
    this.mensagemErro = 'Preencha todos os campos obrigatórios.';
    this.limparAlertas();
    return;
  }

  this.carregando = true; 
  this.usuarioService.criar(this.usuarioForm).subscribe({
    next: (res: any) => {
      this.mensagemSucesso = res.mensagem; 
      this.usuarioForm = { nome: '', email: '', password: '', role: 'gestor' };
      this.carregarUsuarios(); // Recarrega a lista (o Laravel já ordena por ID DESC)
      this.carregando = false;
      this.limparAlertas();
    },
    error: (err) => { 
      this.carregando = false;
      // ✅ Captura a mensagem de erro específica do Laravel (ex: "Este e-mail já está em uso")
      this.mensagemErro = err.error?.mensagem || 'Erro ao criar conta. Verifique os dados.';
      this.limparAlertas();
    }
  });
}

  salvarEdicao(): void {
    this.carregando = true;
    this.usuarioService.atualizar(this.itemParaEditar.id, this.itemParaEditar).subscribe({
      next: () => {
        this.mensagemSucesso = 'Dados atualizados!';
        this.carregando = false;
        this.fecharModalEditar();
        this.carregarUsuarios();
        this.limparAlertas();
      },
      error: () => { this.carregando = false; this.mensagemErro = 'Erro na atualização.'; this.limparAlertas(); }
    });
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;
    this.usuarioService.eliminar(this.idParaExcluir).subscribe({
      next: () => {
        this.mensagemSucesso = 'Utilizador removido.';
        this.fecharModalExcluir();
        this.carregarUsuarios();
        this.limparAlertas();
      },
      error: (err) => { this.mensagemErro = err.error?.mensagem; this.limparAlertas(); }
    });
  }

  // AUXILIARES
  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
      this.carregarUsuarios();
    }
  }

  abrirModalEditar(item: any): void { this.itemParaEditar = { ...item }; this.mostrarModalEditar = true; this.cdr.detectChanges(); }
  fecharModalEditar(): void { this.mostrarModalEditar = false; this.cdr.detectChanges(); }
  abrirModalExcluir(id: number): void { this.idParaExcluir = id; this.mostrarModalExcluir = true; this.cdr.detectChanges(); }
  fecharModalExcluir(): void { this.mostrarModalExcluir = false; this.cdr.detectChanges(); }
  alternarVisibilidadeFormulario(): void { this.formularioVisivel = !this.formularioVisivel; this.cdr.detectChanges(); }
  private limparAlertas(): void { setTimeout(() => { this.mensagemSucesso = ''; this.mensagemErro = ''; this.cdr.detectChanges(); }, 3000); }
}