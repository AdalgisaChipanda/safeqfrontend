import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResposta, Usuario } from '../models/financeiro.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.carregarUsuarioSalvo();
  }

  // Realiza o envio das credenciais para a rota pública de login
  login(credenciais: { email: string; password: string }): Observable<AuthResposta> {
    return this.http.post<AuthResposta>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(resposta => {
        if (resposta && resposta.token) {
          localStorage.setItem('safeq_token', resposta.token);
          localStorage.setItem('safeq_user', JSON.stringify(resposta.usuario));
          this.usuarioSubject.next(resposta.usuario);
        }
      })
    );
  }

  // Revoga o token ativo e limpa 
  logout(): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        localStorage.removeItem('safeq_token');
        localStorage.removeItem('safeq_user');
        this.usuarioSubject.next(null);
      })
    );
  }

  // Verifica
  estaAutenticado(): boolean {
    return localStorage.getItem('safeq_token') !== null;
  }

  // Fornece a estrutura de cabeçalho
  obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  private carregarUsuarioSalvo(): void {
    const userJson = localStorage.getItem('safeq_user');
    if (userJson) {
      this.usuarioSubject.next(JSON.parse(userJson));
    }
  }
}
