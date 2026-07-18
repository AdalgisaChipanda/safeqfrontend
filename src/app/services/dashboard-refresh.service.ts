import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn:'root'
})

export class DashboardRefreshService {


private atualizar =
new Subject<void>();



refresh$ =
this.atualizar.asObservable();



atualizarDashboard(){

this.atualizar.next();

}


}