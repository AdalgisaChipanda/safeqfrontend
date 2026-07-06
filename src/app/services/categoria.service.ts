import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8000/api/categorias';

  constructor(private http: HttpClient) {}

  listar(): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get<any>(this.apiUrl, { headers });
  }

  criar(dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post<any>(this.apiUrl, dados, { headers });
  }

  atualizar(id: number, dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.put<any>(`${this.apiUrl}/${id}`, dados, { headers });
  }

  eliminar(id: number): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
