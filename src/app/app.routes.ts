import { Routes } from '@angular/router';
import { PortalComponent } from './portal/portal.component';
import { MenuComponent } from './menu/menu.component';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { LoginComponent } from './login/login.component';
import { LoginEspecialistaComponent } from './login-especialista/login-especialista.component';
import { MenuEstudianteComponent } from './menu-estudiante/menu-estudiante.component';
import { MenuEspecialistaComponent } from './menu-especialista/menu-especialista.component';
import { RegistrarPacienteComponent } from './registrar-paciente/registrar-paciente.component';
import { RegistrarEspecialistaComponent } from './registrar-especialista/registrar-especialista.component';


export const routes: Routes = [
  { path: '', component: PortalComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'user-selection', component: UserSelectionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'menu-estudiante', component: MenuEstudianteComponent },
  { path: 'login-especialista', component: LoginEspecialistaComponent },
  { path: 'menu-especialista', component: MenuEspecialistaComponent },
  {path: 'registrar-paciente', component: RegistrarPacienteComponent },
  {path: 'registrar-especialista',component: RegistrarEspecialistaComponent},
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
