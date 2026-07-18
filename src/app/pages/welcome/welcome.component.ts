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
  esteiraPausada: boolean = false;
  
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  /**
   *
   */
  alternarPausaEsteira(): void {
    this.esteiraPausada = !this.esteiraPausada;
  }
}
