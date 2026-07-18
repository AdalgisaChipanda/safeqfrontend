import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  credenciais = { email: '', password: '' };
  carregando: boolean = false;
  mensagemErro: string = '';
  mensagemSucesso: string = '';
  
  private alertTimeout: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
  }

  executarAutenticacao(): void {
    if (!this.credenciais.email.trim() || !this.credenciais.password.trim()) {
      this.exibirAlerta('erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.carregando = true;
    this.limparAlertas();

    this.authService.login(this.credenciais).subscribe({
      next: () => {
        // --- SUCESSO ---
        this.mensagemSucesso = 'Autenticação concluída! Bem-vindo.';
        this.carregando = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2500); 
      },
      error: (err) => {
        this.carregando = false;
        let msg = 'E-mail ou palavra-passe incorretos.';
        
        if (err.status === 429) msg = 'Muitas tentativas. Aguarde 1 minuto.';
        if (err.error && err.error.mensagem) msg = err.error.mensagem;

        this.exibirAlerta('erro', msg);
      }
    });
  }

  preencherCamposDemo(email: string, passe: string): void {
    if (this.carregando) return;
    this.credenciais.email = email;
    this.credenciais.password = passe;
    this.limparAlertas();
    this.cdr.detectChanges();
  }

  private exibirAlerta(tipo: 'sucesso' | 'erro', texto: string): void {
    this.limparAlertas();
    
    if (tipo === 'sucesso') {
      this.mensagemSucesso = texto;
    } else {
      this.mensagemErro = texto;
    }

    this.cdr.detectChanges();

    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      this.limparAlertas();
      this.cdr.detectChanges();
    }, 6000);
  }

  private limparAlertas(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }
}