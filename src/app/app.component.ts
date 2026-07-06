import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Estado da interface
  sidebarRecolhida: boolean = false;

  // Dados do utilizador logado
  usuarioNome: string = 'Administrador';
  usuarioPerfil: string = 'ADMIN';

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {
    // Escuta mudanças de rota para atualizar os dados d
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.carregarDadosSessao();
    });
  }

  ngOnInit(): void {
    this.carregarDadosSessao();
  }

  /**
   * Alterna o estado da sidebar 
   * 
   */
  alternarSidebar(): void {
    this.sidebarRecolhida = !this.sidebarRecolhida;
    this.cdr.detectChanges();
  }

  /**
   * Navegação SPA para a gestão de utilizadores
   */
  navegarParaUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Encerra a sessão
   */
  executarLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /**
   * 
   */
  mostrarMenu(): boolean {
    const rotaAtual = this.router.url;
    
    const rotasSemMenu = ['/login', '/', ''];
    
    
    return !rotasSemMenu.includes(rotaAtual.split('?')[0]);
  }

  /**
   * Lê os dados guardados no LocalStorage após o login
   */
  private carregarDadosSessao(): void {
    const dados = localStorage.getItem('safeq_user');
    if (dados) {
      try {
        const user = JSON.parse(dados);
        this.usuarioNome = user.nome || 'Utilizador';
        this.usuarioPerfil = user.role || 'Geral';
      } catch (e) {
        console.error('Erro ao ler dados da sessão', e);
      }
    }
    
    this.cdr.detectChanges();
  }
}