import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.estaAutenticado()) {
      return true;
    }
    
    // Bloqueia o acesso e força o redirecionamento imediato para a tela de login
    return this.router.parseUrl('/login');
  }
}
