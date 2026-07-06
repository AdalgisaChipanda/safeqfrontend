import { Routes } from '@angular/router';

// IMPORTAÇÃO DOS COMPONENTES DAS PÁGINAS
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReceitasComponent } from './pages/receitas/receitas.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  // Rota de Entrada (Landing Page)
  { path: '', component: WelcomeComponent },

  // Autenticação
  { path: 'login', component: LoginComponent },

  // Painel Administrativo e Operacional
  { path: 'dashboard', component: DashboardComponent },
  { path: 'receitas', component: ReceitasComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'relatorios', component: RelatoriosComponent },

  //  CORREÇÃO: Rota de Gestão de Utilizadores 
  { path: 'usuarios', component: UsuariosComponent },

  // Redirecionamento de rotas inexistentes para a raiz
  { path: '**', redirectTo: '' }
];
