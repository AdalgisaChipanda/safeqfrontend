import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/dashboard/financeiro';

  constructor(private http: HttpClient) {}

  /**
   * Obtém dados do Dashboard enviando filtros para o Backend
   */
  obterDados(ano?: string, mes?: string): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    
    // Configura os parâmetros de consulta (?ano=X&mes=Y)
    let params = new HttpParams();
    if (ano) params = params.set('ano', ano);
    if (mes) params = params.set('mes', mes);

    return this.http.get<any>(this.apiUrl, { headers, params });
  }

  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}