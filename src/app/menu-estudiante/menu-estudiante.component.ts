import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router'; // Importa ActivatedRoute

@Component({
  selector: 'app-menu-estudiante',
  templateUrl: './menu-estudiante.component.html',
  styleUrls: ['./menu-estudiante.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Importando FormsModule y CommonModule
})


export class MenuEstudianteComponent implements OnInit {
  userName: string = ''; // Variable para almacenar el nombre del usuario
  preguntas: any[] = []; // Preguntas de todas las secciones
  respuestas: { [key: string]: string } = {}; // Respuestas del usuario
  seccionActual: number = 1; // Sección actual (1, 2 o 3)
  seccionPreguntas: any[] = []; // Preguntas de la sección actual
  resultadosMostrados: boolean = false; // Para mostrar los resultados
  recomendaciones: any = {}; // Resultados procesados

  constructor(private http: HttpClient, private route: ActivatedRoute) {} // Agregar ActivatedRoute al constructor

  ngOnInit(): void {
    // Obtener el nombre desde los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.userName = params['name']; // Asigna el nombre recibido al userName
      console.log('Nombre del usuario:', this.userName); // Verifica que se captura correctamente
    });

    this.cargarPreguntas(); // Seguir con la carga de las preguntas
  }

  // Cargar todas las preguntas desde el backend
  cargarPreguntas(): void {
    this.http.get('https://backend-sistema-experto.onrender.com/pregunta').subscribe(
      (response: any) => {
        console.log(response.data); // Verificar si las preguntas llegan correctamente
        this.preguntas = response.data;
        this.actualizarPreguntasSeccion(); // Mostrar las preguntas de la primera sección
      },
      (error) => {
        console.error('Error al cargar las preguntas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar las preguntas',
          text: 'Hubo un problema al cargar las preguntas. Intenta nuevamente.',
        });
      }
    );
  }

  // Obtener el título de la sección actual
  obtenerTituloSeccion(): string {
    if (this.seccionActual === 1) {
      return 'Programación y Desarrollo';
    } else if (this.seccionActual === 2) {
      return 'Intereses y Preferencias';
    } else {
      return 'Habilidades Técnicas y Conocimientos';
    }
  }

  // Obtener la descripción de la sección actual
  obtenerDescripcionSeccion(): string {
    if (this.seccionActual === 1) {
      return 'Responde las preguntas sobre tu experiencia en programación.';
    } else if (this.seccionActual === 2) {
      return 'Selecciona tus áreas de interés.';
    } else {
      return 'Evalúa tus habilidades técnicas y conocimientos.';
    }
  }

  // Cambiar a la siguiente sección del cuestionario
  siguienteSeccion(): void {
    if (!this.validarRespuestasSeccion()) {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor responde todas las preguntas',
        text: 'Debes responder todas las preguntas antes de continuar.',
      });
      return;
    }

    this.seccionActual++;
    this.actualizarPreguntasSeccion();
  }

  // Validar que todas las preguntas de la sección actual estén respondidas
  validarRespuestasSeccion(): boolean {
    return this.seccionPreguntas.every(pregunta => this.respuestas[pregunta.codigo]);
  }

  // Actualizar las preguntas de la sección actual
  actualizarPreguntasSeccion(): void {
    if (this.seccionActual === 1) {
      this.seccionPreguntas = this.preguntas.slice(0, 8); // Programación y Desarrollo
    } else if (this.seccionActual === 2) {
      this.seccionPreguntas = this.preguntas.slice(8, 29); // Intereses y Preferencias
    } else if (this.seccionActual === 3) {
      this.seccionPreguntas = this.preguntas.slice(29, 37); // Habilidades Técnicas y Conocimientos
    }
  }

  // Enviar las respuestas al backend
  enviarCuestionario(): void {
    if (!this.validarRespuestasSeccion()) {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor responde todas las preguntas',
        text: 'Debes responder todas las preguntas antes de enviar el cuestionario.',
      });
      return;
    }

    console.log("Respuestas que se van a enviar:", this.respuestas);

    this.http.post('https://backend-sistema-experto.onrender.com/procesar_respuestas', { respuestas: this.respuestas }).subscribe(
      (response: any) => {
        console.log("Respuesta del backend:", response); 
        this.recomendaciones = response.recomendaciones;
        this.resultadosMostrados = true;

        Swal.fire({
          icon: 'success',
          title: '¡Cuestionario completado!',
          text: 'Tus respuestas han sido enviadas correctamente.',
        });
      },
      (error) => {
        console.error('Error al enviar el cuestionario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar',
          text: 'Hubo un problema al enviar tus respuestas.',
        });
      }
    );
  }

  // Método para obtener el número acumulado de la pregunta
  obtenerNumeroPregunta(i: number): number {
    if (this.seccionActual === 1) {
      return i + 1; // Para la primera sección
    } else if (this.seccionActual === 2) {
      return i + 9; // Para la segunda sección, empieza en la pregunta 9
    } else {
      return i + 30; // Para la tercera sección, empieza en la pregunta 30
    }
  }

  // Reiniciar el test para volver a empezar
  reiniciarTest(): void {
    this.seccionActual = 1;
    this.resultadosMostrados = false;
    this.respuestas = {};
    this.actualizarPreguntasSeccion();
  }
}