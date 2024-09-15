import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'https://backend-sistema-experto.onrender.com/usuarios/v1';

  constructor(private http: HttpClient) {}

  startConversation(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chatbot`, data);
  }

  continueConversation(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/seguir_conversacion`, data);
  }

  listConversations(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/listar_conversaciones`, data);
  }

  getConversation(username: string, titulo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/obtener_conversacion`, { username, titulo });
  }

  deleteConversation(username: string, titulo: string): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/eliminar_conversacion`, { body: { username, titulo } });
  }
}
