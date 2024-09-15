import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Este es necesario para ngModel
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from './pipes/pipes.module';  // Importa el módulo de Pipes
import { NewlineToBrPipe } from './pipes/newline-to-br.pipe'; // Importa la Pipe
import { AppComponent } from './app.component';
import { PortalComponent } from './portal/portal.component';
import { MenuComponent } from './menu/menu.component';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { LoginComponent } from './login/login.component';
import { LoginEspecialistaComponent } from './login-especialista/login-especialista.component';
import { MenuEstudianteComponent } from './menu-estudiante/menu-estudiante.component';
import { MenuEspecialistaComponent } from './menu-especialista/menu-especialista.component';
import { RegistrarPacienteComponent } from './registrar-paciente/registrar-paciente.component';
import { RegistrarEspecialistaComponent } from './registrar-especialista/registrar-especialista.component';
import { LocalStorageService } from './service/local-storage.service';
import { PreguntasService } from './service/preguntas.service';
const routes: Routes = [
  { path: '', component: PortalComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'user-selection', component: UserSelectionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'menu-estudiante', component: MenuEstudianteComponent },
  { path: 'login-especialista', component: LoginEspecialistaComponent },
  { path: 'menu-especialista', component: MenuEspecialistaComponent },
  { path: 'registrar-paciente', component: RegistrarPacienteComponent },
  { path: 'registrar-especialista', component: RegistrarEspecialistaComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    PortalComponent,
    MenuComponent,
    UserSelectionComponent,
    LoginComponent,
    MenuEstudianteComponent,
    MenuEspecialistaComponent,
    RegistrarPacienteComponent,
    NewlineToBrPipe, // Declara la Pipe,
    PipesModule  // Importa el módulo de Pipes
  ],
  imports: [
    BrowserModule,
    FormsModule, 
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [LocalStorageService, PreguntasService],
  bootstrap: [AppComponent]
})
export class AppModule { }
