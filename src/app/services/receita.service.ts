import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtém a lista completa de receitas
   */
  obterReceitas(filtros?: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get<any>(`${this.apiUrl}/receitas`, { headers, params: filtros });
  }

  /**
   * Envia uma nova receita 
   */
  salvarReceita(dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post<any>(`${this.apiUrl}/receitas`, dados, { headers });
  }

  /**
   * Obtém a lista completa de despesas
   */
  obterDespesas(filtros?: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.get<any>(`${this.apiUrl}/despesas`, { headers, params: filtros });
  }

  /**
   * Envia uma nova despesa 
   */
  salvarDespesa(dados: any): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    return this.http.post<any>(`${this.apiUrl}/despesas`, dados, { headers });
  }

  /**
   * 
   */
  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
