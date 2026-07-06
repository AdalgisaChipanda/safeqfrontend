import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  // Controle de estado reativo para pausar o carrossel via clique
  esteiraPausada: boolean = false;
  
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  /**
   * Ativa ou desativa a pausa do movimento contínuo dos cartões corporativos.
   */
  alternarPausaEsteira(): void {
    this.esteiraPausada = !this.esteiraPausada;
  }
}
