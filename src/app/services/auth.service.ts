import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthResposta, Usuario } from '../models/financeiro.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Endereço oficial do backend SAFEQ
  private readonly baseUrl = 'http://localhost:8000/api';
  
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.carregarSessao();
  }

  /**
   * Executa o login no sistema
   */
  login(credenciais: { email: string; password: string }): Observable<AuthResposta> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResposta>(`${this.baseUrl}/login`, credenciais, { headers }).pipe(
      tap(res => {
        if (res && res.token) {
          this.salvarSessao(res.token, res.usuario);
        }
      }),
      catchError(err => {
        console.error('Erro na comunicação com o servidor:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * 
   */
  logout(): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.limparSessao()),
      catchError(err => {
        this.limparSessao(); // Limpa localmente mesmo se a rede falhar
        return throwError(() => err);
      })
    );
  }

  /**
   * 
   */
  estaAutenticado(): boolean {
    const token = localStorage.getItem('safeq_token');
    return !!token;
  }

  /**
   * Gera o cabeçalho de autorização 
   */
  obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  private salvarSessao(token: string, usuario: Usuario): void {
    localStorage.setItem('safeq_token', token);
    localStorage.setItem('safeq_user', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  private limparSessao(): void {
    localStorage.removeItem('safeq_token');
    localStorage.removeItem('safeq_user');
    this.usuarioSubject.next(null);
  }

  private carregarSessao(): void {
    const userJson = localStorage.getItem('safeq_user');
    if (userJson) {
      try {
        this.usuarioSubject.next(JSON.parse(userJson));
      } catch {
        this.limparSessao();
      }
    }
  }
}