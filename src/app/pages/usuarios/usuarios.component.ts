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
  encapsulation: ViewEncapsulation.Emulated
})
export class UsuariosComponent implements OnInit {
  // --- ESTADOS DE DADOS ---
  usuarios: any[] = [];
  usuarioForm = { nome: '', email: '', password: '', role: 'gestor' };
  itemParaEditar: any = {};
  
  // --- ESTADOS DE UI ---
  carregando: boolean = false;
  carregandoTabela: boolean = false;
  usuarioPerfil: string = '';

  // --- SISTEMA DE TOAST  ---
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'sucesso' | 'erro' = 'sucesso';

  // --- CONTROLE DE MODAIS ---
  mostrarModalEditar: boolean = false;
  mostrarModalExcluir: boolean = false;
  idParaExcluir: number | null = null;

  // --- PAGINAÇÃO ---
  paginaAtual: number = 1;
  totalPaginas: number = 1;
  totalRegistros: number = 0;

  constructor(
    private usuarioService: UsuarioService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const dados = localStorage.getItem('safeq_user');
    if (dados) {
      this.usuarioPerfil = JSON.parse(dados).role;
    }
    this.carregarUsuarios();
  }

  // --- MÉTODO DE NOTIFICAÇÃO  ---
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
  carregarUsuarios(): void {
    this.carregandoTabela = true;
    this.cdr.detectChanges();

    this.usuarioService.listar(this.paginaAtual).subscribe({
      next: (res: any) => {
        if (res.dados) {
          this.usuarios = res.dados.data || [];
          this.paginaAtual = res.dados.current_page;
          this.totalPaginas = res.dados.last_page;
          this.totalRegistros = res.dados.total;
        }
        this.carregandoTabela = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoTabela = false;
        this.notify('Erro ao carregar lista de utilizadores.', 'erro');
      }
    });
  }

  // --- MUDANÇA DE PÁGINA ---
  mudarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.paginaAtual) return;
    this.paginaAtual = p;
    this.carregarUsuarios();
  }

  // --- OPERAÇÕES CRUD ---
  criarUsuario(): void {
    if (!this.usuarioForm.nome || !this.usuarioForm.email || !this.usuarioForm.password) {
      this.notify('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    this.carregando = true;
    this.usuarioService.criar(this.usuarioForm).subscribe({
      next: () => {
        this.notify('Utilizador guardado com sucesso!', 'sucesso');
        this.usuarioForm = { nome: '', email: '', password: '', role: 'gestor' };
        this.paginaAtual = 1;
        this.carregarUsuarios();
        this.carregando = false;
      },
      error: (err) => {
        this.carregando = false;
        let msg = 'Erro ao registar utilizador.';
        if (err.status === 422) {
          const erros: any = Object.values(err.error.errors);
          msg = erros[0][0];
        }
        this.notify(msg, 'erro');
      }
    });
  }

  salvarEdicao(): void {
    this.carregando = true;
    this.usuarioService.atualizar(this.itemParaEditar.id, this.itemParaEditar).subscribe({
      next: () => {
        this.notify('Perfil atualizado com sucesso!', 'sucesso');
        this.fecharModalEditar();
        this.carregarUsuarios();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notify('Erro ao atualizar dados.', 'erro');
      }
    });
  }

  confirmarExclusao(): void {
    if (!this.idParaExcluir) return;
    this.usuarioService.eliminar(this.idParaExcluir).subscribe({
      next: () => {
        this.notify('Utilizador removido do sistema.', 'sucesso');
        this.fecharModalExcluir();
        this.carregarUsuarios();
      },
      error: (err) => {
        this.fecharModalExcluir();
        const msg = err.error?.mensagem || 'Erro ao remover utilizador.';
        this.notify(msg, 'erro');
      }
    });
  }

  abrirModalEditar(user: any) {
    this.itemParaEditar = JSON.parse(JSON.stringify(user));
    this.mostrarModalEditar = true;
    this.cdr.detectChanges(); 
  }

  fecharModalEditar() {
    this.mostrarModalEditar = false;
    this.cdr.detectChanges();
  }

  abrirModalExcluir(id: number) {
    this.idParaExcluir = id;
    this.mostrarModalExcluir = true;
    this.cdr.detectChanges(); 
  }

  fecharModalExcluir() {
    this.mostrarModalExcluir = false;
    this.idParaExcluir = null;
    this.cdr.detectChanges();
  }
}