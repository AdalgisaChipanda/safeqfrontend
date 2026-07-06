import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Listagem paginada de utilizadores
  listar(pagina: number = 1): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get<any>(`${this.apiUrl}/usuarios?page=${pagina}`, { headers });
  }

  //  Alinhado com a rota Route
  criar(dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post<any>(`${this.apiUrl}/usuarios/cadastrar`, dados, { headers });
  }

  // Atualização de dados do utilizador
  atualizar(id: number, dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, dados, { headers });
  }

  // Remoção de utilizador
  eliminar(id: number): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, { headers });
  }

  // Cabeçalho com Token Sanctum do utilizador logado
  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
   