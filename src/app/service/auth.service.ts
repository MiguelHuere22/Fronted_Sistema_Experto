import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL: string = 'https://backend-sistema-experto.onrender.com';

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {}

  loginPaciente(username: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/usuarios/v1/login/paciente`, { username, password }).pipe(
      map((response: any) => {
        if (response && response.data) {
          this.localStorageService.setItem('userData', JSON.stringify(response.data));
        }
        return response;
      })
    );
  }

  loginEspecialista(username: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/usuarios/v1/login/especialista`, { username, password }).pipe(
      map((response: any) => {
        if (response && response.data && response.personaData) {
          this.localStorageService.setItem('authToken', 'true');
          this.localStorageService.setItem('userData', JSON.stringify(response.data));
          this.localStorageService.setItem('personaData', JSON.stringify(response.personaData));
          this.localStorageService.setItem('id_especialista', response.data.id_persona);
        }
        return response;
      })
    );
  }

  registrarPersonaYUsuario(formData: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/registrar-persona-usuario`, formData).pipe(
      map((response: any) => {
        console.log('Respuesta del servidor:', response);  // Log para verificar respuesta del servidor
        return response;
      })
    );
  }
}
