import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credenciais = {
    email: '',
    password: ''
  };

  carregando = false;
  mensagemErro = '';
  private alertaTimeout: any = null;

  // Injeta o ChangeDetectorRef para garantir que a tela atualiza ao sumir o alerta
  constructor(
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  executarAutenticacao(): void {
    if (!this.credenciais.email || !this.credenciais.password) {
      this.exibirAlertaTemporario('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    this.authService.login(this.credenciais).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
           error: (err) => {
        this.carregando = false;
        // Se o Laravel rejeitar o login (401 ou 422), exibe a mensagem no Toast superior direito
        if (err.error && err.error.mensagem) {
          this.exibirAlertaTemporario(err.error.mensagem);
        } else {
          this.exibirAlertaTemporario('Credenciais incorretas. Verifique o e-mail corporativo e a palavra-passe.');
        }
      }

    });
  }

  preencherCamposDemo(email: string, passe: string): void {
    this.credenciais.email = email;
    this.credenciais.password = passe;
    this.mensagemErro = ''; 
    if (this.alertaTimeout) clearTimeout(this.alertaTimeout);
    this.cdr.detectChanges();
  }

  /**
   * Apresenta o alerta 
   */
  private exibirAlertaTemporario(mensagem: string): void {
    this.mensagemErro = mensagem;
    this.cdr.detectChanges(); 
    
    if (this.alertaTimeout) {
      clearTimeout(this.alertaTimeout);
    }

    // Executa a limpeza e força a atualização da tela
    this.alertaTimeout = setTimeout(() => {
      this.mensagemErro = '';
      this.cdr.detectChanges(); 
    }, 4000);
  }
}

