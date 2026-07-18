import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = 'http://localhost:8000/api/relatorios';

  constructor(private http: HttpClient) {}

  /**
   * Obtém os dados para exibir 
   */
  obterDadosAnaliticos(tipo: string, dataInicio: string, dataFim: string): Observable<any> {
    const headers = this.obterHeadersAutenticados();
    const params = `?tipo=${tipo}&data_inicio=${dataInicio}&data_fim=${dataFim}`;
    return this.http.get<any>(`${this.apiUrl}${params}`, { headers });
  }

  /**
   * Descarrega o Excel 
   */
  exportarExcel(tipo: string, dataInicio: string, dataFim: string): Observable<Blob> {
    const headers = this.obterHeadersAutenticados();
    const url = `${this.apiUrl}/exportar-excel?tipo=${tipo}&data_inicio=${dataInicio}&data_fim=${dataFim}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  /**
   * Descarrega o PDF 
   */
  exportarPdf(tipo: string, dataInicio: string, dataFim: string): Observable<Blob> {
    const headers = this.obterHeadersAutenticados();
    const url = `${this.apiUrl}/exportar-pdf?tipo=${tipo}&data_inicio=${dataInicio}&data_fim=${dataFim}`;
    return this.http.get(url, { headers, responseType: 'blob' });
  }

  private obterHeadersAutenticados(): HttpHeaders {
    const token = localStorage.getItem('safeq_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
