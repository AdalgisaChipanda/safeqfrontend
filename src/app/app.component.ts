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
  sidebarAberta: boolean = false;
  usuarioNome: string = 'Administrador';
  usuarioPerfil: string = 'ADMIN';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.sidebarAberta = false; 
      this.carregarDadosSessao();
    });
  }

  ngOnInit(): void {
    this.carregarDadosSessao();
  }

  alternarSidebar(): void {
    this.sidebarAberta = !this.sidebarAberta;
    this.cdr.detectChanges();
  }

  navegarParaUsuarios(): void {
    this.sidebarAberta = false;
    this.router.navigate(['/usuarios']);
  }

  executarLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  mostrarMenu(): boolean {
    const publicRoutes = ['/login', '/', ''];
    return !publicRoutes.includes(this.router.url.split('?')[0]);
  }

  private carregarDadosSessao(): void {
    const dados = localStorage.getItem('safeq_user');
    if (dados) {
      try {
        const user = JSON.parse(dados);
        this.usuarioNome = user.nome || 'Utilizador';
        this.usuarioPerfil = user.role || 'Geral';
      } catch (e) {
        console.error('Erro na sessão', e);
      }
    }
    this.cdr.detectChanges();
  }
}