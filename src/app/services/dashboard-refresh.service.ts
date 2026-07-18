import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardRefreshService {

  private refreshSubject = new Subject<void>();

  constructor() { }

  /**
   * chama sempre que uma ação 
   * (Criar, Editar, Eliminar) 
   */
  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  /**
   * O Dashboard ficará "escutando" este Observable.
   */
  get onRefresh(): Observable<void> {
    return this.refreshSubject.asObservable();
  }
}