import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../service/local-storage.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import 'leaflet.heat';
import { jsPDF } from 'jspdf';
import autoTable, { CellInput, RowInput } from 'jspdf-autotable';

@Component({
  selector: 'app-menu-especialista',
  standalone: true,
  templateUrl: './menu-especialista.component.html',
  styleUrls: ['./menu-especialista.component.css'],
  imports: [CommonModule, FormsModule]
})
export class MenuEspecialistaComponent implements OnInit {
  contador: number = 0;
  id_persona: string = '';
  nombres: string = '';
  apellidoPaterno: string = '';
  apellidoMaterno: string = '';
  sexo: string = '';
  telefono: string = '';
  departamento: string = '';
  provincia: string = '';
  distrito: string = '';
  selectedOption: string = 'inicio';
  puntuaciones: any[] = [];
  puntuacionesFiltradas: any[] = [];
  puntuacionesMapa: any[] = [];
  observaciones: any[] = [];
  selectedPuntuacion: any = null;
  preguntas: any[] = [];
  observacionesTexto: string = '';
  nivelAnsiedad: string = '';
  solicitudCita: string = '';
  tratamiento: string[] = [];
  tratamientoBusqueda: string = '';
  tratamientosFiltrados: any[] = [];
  map: any;
  heatLayer: any;

  filtroTipoTest: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroNivelAnsiedad: string = '';
  
  filtroMapaTipoTest: string = '';
  filtroMapaFechaInicio: string = '';
  filtroMapaFechaFin: string = '';
  filtroMapaNivelAnsiedad: string = '';

  nivelesAnsiedad: any[] = [];
  recomendaciones: any[] = [];
  menuAbierto: boolean = true;
  fundamentacionCientifica: string = '';

  orden: { campo: string, direccion: 'asc' | 'desc' } = { campo: '', direccion: 'asc' };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.contador == 0) {
      this.loadUserData();
      this.contador = this.contador + 1;
    }
    this.cargarNivelesAnsiedad();
    this.cargarRecomendaciones();
    this.obtenerObservaciones();
  }

  loadUserData(): void {
    const personaDataString = this.localStorageService.getItem('personaData');
    if (personaDataString) {
      try {
        const personaData = JSON.parse(personaDataString);
        if (personaData && typeof personaData === 'object') {
          this.nombres = personaData.nombres || '';
          this.apellidoPaterno = personaData.apellido_paterno || '';
          this.apellidoMaterno = personaData.apellido_materno || '';
          this.id_persona = personaData.id_persona || '';
          this.sexo = personaData.sexo || '';
          this.telefono = personaData.telefono || '';
          this.departamento = personaData.departamento || '';
          this.provincia = personaData.provincia || '';
          this.distrito = personaData.distrito || '';
        }
      } catch (error) {
        console.error('Error parsing persona data from localStorage:', error);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarNivelesAnsiedad(): void {
    this.http.get<any>('https://backend-sistema-experto.onrender.com/nivelansiedades/v1/listar').subscribe(
      response => {
        if (response.status_code === 200) {
          this.nivelesAnsiedad = response.data;
        } else {
          console.error('Error fetching niveles de ansiedad:', response.msg);
        }
      },
      error => {
        console.error('Error fetching niveles de ansiedad:', error);
      }
    );
  }

  cargarRecomendaciones(): void {
    this.http.get<any>('https://backend-sistema-experto.onrender.com/recomendaciones/v1/listar').subscribe(
      response => {
        if (response.status_code === 200) {
          this.recomendaciones = response.data;
          this.tratamientosFiltrados = this.recomendaciones;
        } else {
          console.error('Error fetching recomendaciones:', response.msg);
        }
      },
      error => {
        console.error('Error fetching recomendaciones:', error);
      }
    );
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    if (option === 'consulta') {
      this.obtenerPuntuaciones();
    }
  }

  obtenerObservaciones(): void {
    this.http.get<any>('https://backend-sistema-experto.onrender.com/observaciones/v1/listar').subscribe(
      response => {
        if (response.status_code === 200) {
          this.observaciones = response.data;
        } else {
          console.error('Error fetching observaciones:', response.msg);
        }
      },
      error => {
        console.error('Error fetching observaciones:', error);
      }
    );
  }

  obtenerPuntuaciones(): void {
    this.http.get<any>('https://backend-sistema-experto.onrender.com/puntuaciones/v1/todos').subscribe(
      response => {
        if (response.status_code === 200) {
          this.puntuaciones = response.data;
          this.puntuaciones.forEach(puntuacion => {
            puntuacion.estado = this.observaciones.some(obs => obs.id_puntuacion === puntuacion.id_puntuacion) ? 'Observado' : 'Pendiente';
          });
          this.puntuacionesFiltradas = this.puntuaciones;
          this.puntuacionesMapa = this.puntuaciones;
          this.initMap();
          this.addHeatMapLayer();
        } else {
          console.error('Error fetching puntuaciones:', response.msg);
        }
      },
      error => {
        console.error('Error fetching puntuaciones:', error);
      }
    );
  }

  selectPuntuacion(puntuacion: any): void {
    this.selectedPuntuacion = puntuacion;
    this.limpiarCamposEvaluacion();
    this.preguntas = [];
    this.obtenerPreguntasRespuestas(puntuacion.id_persona, puntuacion.id_test);
    this.obtenerCorreoPaciente(puntuacion.id_persona);
  }

  obtenerCorreoPaciente(idPersona: number): void {
    this.http.get<any>(`https://backend-sistema-experto.onrender.com/usuarios/v1/correo/${idPersona}`).subscribe(
      response => {
        if (response.status_code === 200) {
          this.selectedPuntuacion.correo = response.data.correo;
        } else {
          console.error('Error fetching correo:', response.msg);
        }
      },
      error => {
        console.error('Error fetching correo:', error);
      }
    );
  }

  limpiarCamposEvaluacion(): void {
    this.observacionesTexto = '';
    this.nivelAnsiedad = '';
    this.solicitudCita = '';
    this.tratamiento = [];
    this.fundamentacionCientifica = '';
  }

  evaluar(): void {
    if (this.selectedPuntuacion) {
      const message = this.selectedPuntuacion.estado === 'Observado'
        ? 'Este paciente ya ha sido evaluado. ¿Está seguro de que desea evaluar nuevamente a este paciente?'
        : '¿Está seguro de que desea evaluar a este paciente?';

      Swal.fire({
        title: 'Evaluar Paciente',
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Sí, evaluar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedOption = 'evaluar';
        }
      });
    }
  }

  mostrarFundamentacionCientifica(event: any): void {
    const descripcion = event.target.value;
    const nivelSeleccionado = this.nivelesAnsiedad.find(nivel => nivel.descripcion === descripcion);
    this.fundamentacionCientifica = nivelSeleccionado ? nivelSeleccionado.fundamentacion_cientifica : '';
  }

  obtenerPreguntasRespuestas(idPersona: number, idTest: number): void {
    this.http.post<any>('https://backend-sistema-experto.onrender.com/respuestas/v1/listar', { id_persona: idPersona, id_test: idTest }).subscribe(
      response => {
        if (response.status_code === 200) {
          this.preguntas = response.data.respuestas;
        } else {
          console.error('Error fetching preguntas:', response.msg);
        }
      },
      error => {
        console.error('Error fetching preguntas:', error);
      }
    );
  }

  guardarObservacion(): void {
    const idEspecialista = this.localStorageService.getItem('id_especialista');

    if (!idEspecialista) {
      Swal.fire('Error', 'No se encontró información del especialista', 'error');
      return;
    }

    const observacion = {
      id_puntuacion: this.selectedPuntuacion.id_puntuacion,
      id_especialista: parseInt(idEspecialista),
      observaciones: this.observacionesTexto,
      nivel_ansiedad: this.nivelAnsiedad,
      solicitud_cita: this.solicitudCita,
      tratamiento: this.tratamiento.join('\n')
    };

    this.http.post<any>('https://backend-sistema-experto.onrender.com/observaciones/v1/agregar', observacion).subscribe(
      response => {
        if (response.status_code === 201) {
          Swal.fire('Guardado', 'La observación se ha guardado exitosamente', 'success');
          this.selectedOption = 'consulta';
          this.obtenerPuntuaciones();
        } else {
          console.error('Error saving observacion:', response.msg);
        }
      },
      error => {
        console.error('Error saving observacion:', error);
      }
    );
  }

  toggleTratamiento(recomendacion: string): void {
    const index = this.tratamiento.indexOf(recomendacion);
    if (index > -1) {
      this.tratamiento.splice(index, 1);
    } else {
      this.tratamiento.push(recomendacion);
    }
  }

  filtrarTratamientos(): void {
    const query = this.tratamientoBusqueda.toLowerCase();
    this.tratamientosFiltrados = this.recomendaciones.filter(recomendacion =>
      recomendacion.descripcion.toLowerCase().includes(query)
    );
  }

  enviarCorreo(): void {
    const pdf = new jsPDF();
    pdf.setFontSize(13);

    // Variables del encabezado
    const logoUrl = '/assets/unmsm.png';
    const title = 'SISVITA';
    const subtitle = 'Test de Ansiedad (' + this.selectedPuntuacion.tipo_test + ')';

    const titleX = pdf.internal.pageSize.getWidth() / 2;
    const titleY = 15;

    // Función para agregar encabezado solo en la primera página
    const addHeader = (pdf: jsPDF, isFirstPage: boolean) => {
        if (isFirstPage) {
            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.text(title, titleX, titleY, { align: 'center' });
            pdf.setFont('helvetica', 'normal');
            pdf.text(subtitle, titleX, titleY + 10, { align: 'center' });

            // Agregar logo
            pdf.addImage(logoUrl, 'PNG', 10, 10, 30, 30);
        }
    };

    // Llamada inicial al encabezado
    addHeader(pdf, true);

    // Formatear fecha de nacimiento al formato YYYY-MM-DD
    const formattedFechaNacimiento = new Date(this.selectedPuntuacion.fecha_nacimiento).toISOString().split('T')[0];

    const pacienteData: CellInput[][] = [
        ["Nombres:", `${this.selectedPuntuacion.nombre} ${this.selectedPuntuacion.apellido_paterno} ${this.selectedPuntuacion.apellido_materno}`],
        ["Sexo:", `${this.selectedPuntuacion.sexo}`],
        ["Fecha de Nacimiento:", `${formattedFechaNacimiento}`],
        ["Dirección:", `${this.selectedPuntuacion.ubigeo.departamento}/${this.selectedPuntuacion.ubigeo.provincia}/${this.selectedPuntuacion.ubigeo.distrito}`],
        ["Fecha del Test:", `${this.selectedPuntuacion.fecha.split(' ')[0]}`],
        ["Teléfono:", `${this.selectedPuntuacion.telefono}`]
    ];

    autoTable(pdf, {
        body: pacienteData,
        startY: titleY + 30,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { fontStyle: 'bold' }
        }
    });

    pdf.setFontSize(10);

    const headers = this.getTestHeaders(this.selectedPuntuacion.tipo_test);
    const tableColumnHeaders: CellInput[] = ['Preguntas', ...headers];

    let tableRows: RowInput[] = [];
    this.preguntas.forEach((pregunta, index) => {
        const row: CellInput[] = [`${index + 1}. ${pregunta.pregunta}`];
        headers.forEach(header => {
            row.push(pregunta.respuesta === header ? 'X' : ''); // Use 'X' instead of checkmark
        });
        tableRows.push(row);
    });

    autoTable(pdf, {
        head: [tableColumnHeaders],
        body: tableRows,
        startY: (pdf as any).lastAutoTable ? (pdf as any).lastAutoTable.finalY + 10 : titleY + 60,
        theme: 'grid'
    });

    const previousAutoTable = (pdf as any).lastAutoTable;
    const totalPuntos = `Total de Puntos: ${this.selectedPuntuacion.puntaje_total}`;
    pdf.text(totalPuntos, 10, previousAutoTable.finalY + 10);

    const citaY = previousAutoTable.finalY + 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Invitación a cita:`, 10, citaY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${this.solicitudCita}`, 60, citaY);

    // Añadir las recomendaciones ordenadas en una tabla con X
    const tratamientos: RowInput[] = this.tratamiento.map((tratamiento) => [
        { content: tratamiento, styles: { halign: 'left' } },
        { content: 'X', styles: { halign: 'center' } } // Use 'X' instead of checkmark
    ]);

    autoTable(pdf, {
        head: [['Tratamiento', '']],
        body: tratamientos,
        startY: citaY + 20,
        theme: 'grid',
        styles: {
            fontSize: 10,
            cellPadding: 2,
            overflow: 'linebreak',
            fillColor: [224, 240, 255] // Light blue color for the body
        },
        headStyles: {
            fillColor: [0, 123, 255] // Darker blue for the header text
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 10 }
        }
    });

    // Añadir datos del especialista, nivel de ansiedad y observaciones dentro de un cuadro
    const especialistaY = (pdf as any).lastAutoTable ? (pdf as any).lastAutoTable.finalY + 20 : citaY + 40;
    pdf.setFontSize(12);
    const especialistaData = [
        `Especialista: ${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno}`,
        `Teléfono: ${this.telefono}`,
        `Nivel de ansiedad: ${this.nivelAnsiedad}`,
        `Observaciones: ${this.observacionesTexto}`
    ];

    const splitEspecialistaData = especialistaData.flatMap((line, index) => {
        const lines = pdf.splitTextToSize(line, 180);
        return lines.concat(index < especialistaData.length - 1 ? [''] : []);
    });

    // Calcular la altura del cuadro
    const lineHeight = 12;
    const boxHeight = splitEspecialistaData.length * lineHeight + 15; // 15 de padding

    // Dibujar el cuadro
    pdf.rect(10, especialistaY, 190, boxHeight);
    pdf.text(splitEspecialistaData, 15, especialistaY + 15);

    const pdfBlob = pdf.output('blob');

    const formData = new FormData();
    formData.append('id_persona', this.selectedPuntuacion.id_persona);
    formData.append('asunto', 'Resultados del test');
    formData.append('pdf', pdfBlob, 'resultados.pdf');

    this.http.post('https://backend-sistema-experto.onrender.com/enviar-correo', formData).subscribe(response => {
        Swal.fire('Enviado', 'Correo enviado exitosamente', 'success');
    }, error => {
        console.error('Error enviando correo:', error);
        Swal.fire('Error', 'Hubo un problema al enviar el correo', 'error');
    });
  }

  getTestHeaders(tipoTest: string): string[] {
    switch (tipoTest) {
      case 'Test de AMASC':
        return ['Sí', 'No'];
      case 'Test de Beck':
        return ['Nunca', 'Raramente', 'Algunas veces', 'A menudo'];
      case 'Test de Zung':
        return ['Muy Pocas Veces', 'A veces', 'Muchas Veces', 'Casi Siempre'];
      default:
        return [];
    }
  }

  logout(): void {
    this.localStorageService.clear();
    this.router.navigate(['/login']);
  }

  initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map('heatmap').setView([-12.046374, -77.042793], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  addHeatMapLayer(): void {
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }
    const heatPoints = this.puntuacionesMapa
      .filter(puntuacion => puntuacion.ubigeo.latitud && puntuacion.ubigeo.longitud)
      .map(puntuacion => {
        const lat = puntuacion.ubigeo.latitud;
        const lng = puntuacion.ubigeo.longitud;
        return [lat, lng, 2000];
      });
    this.heatLayer = (L as any).heatLayer(heatPoints, { radius: 25 }).addTo(this.map);
  }

  filtrarPuntuaciones(): void {
    this.puntuacionesFiltradas = this.puntuaciones.filter(puntuacion => {
      const coincideTipoTest = this.filtroTipoTest ? puntuacion.tipo_test === this.filtroTipoTest : true;
      const coincideFechaInicio = this.filtroFechaInicio ? new Date(puntuacion.fecha) >= new Date(this.filtroFechaInicio) : true;
      const coincideFechaFin = this.filtroFechaFin ? new Date(puntuacion.fecha) <= new Date(this.filtroFechaFin) : true;
      const coincideNivelAnsiedad = this.filtroNivelAnsiedad ? puntuacion.color === this.filtroNivelAnsiedad : true;
      return coincideTipoTest && coincideFechaInicio && coincideFechaFin && coincideNivelAnsiedad;
    });

    this.ordenarPuntuaciones();
  }

  ordenarPor(campo: string): void {
    if (this.orden.campo === campo) {
      this.orden.direccion = this.orden.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.orden.campo = campo;
      this.orden.direccion = 'asc';
    }
    this.ordenarPuntuaciones();
  }

  ordenarPuntuaciones(): void {
    this.puntuacionesFiltradas.sort((a, b) => {
      let valorA = a[this.orden.campo];
      let valorB = b[this.orden.campo];

      if (this.orden.campo === 'puntaje_total') {
       
        valorA = parseFloat(valorA);
        valorB = parseFloat(valorB);
      } else if (this.orden.campo === 'apellidos') {
        
        valorA = `${a.apellido_paterno} ${a.apellido_materno}`;
        valorB = `${b.apellido_paterno} ${b.apellido_materno}`;
      }

      let comparacion = 0;

      if (valorA > valorB) {
        comparacion = 1;
      } else if (valorA < valorB) {
        comparacion = -1;
      }

      return this.orden.direccion === 'asc' ? comparacion : -comparacion;
    });
  }

  filtrarPuntuacionesMapa(): void {
    this.puntuacionesMapa = this.puntuaciones.filter(puntuacion => {
      const coincideTipoTest = this.filtroMapaTipoTest ? puntuacion.tipo_test === this.filtroMapaTipoTest : true;
      const coincideFechaInicio = this.filtroMapaFechaInicio ? new Date(puntuacion.fecha) >= new Date(this.filtroMapaFechaInicio) : true;
      const coincideFechaFin = this.filtroMapaFechaFin ? new Date(puntuacion.fecha) <= new Date(this.filtroMapaFechaFin) : true;
      const coincideNivelAnsiedad = this.filtroMapaNivelAnsiedad ? puntuacion.color === this.filtroMapaNivelAnsiedad : true;
      return coincideTipoTest && coincideFechaInicio && coincideFechaFin && coincideNivelAnsiedad;
    });
    this.addHeatMapLayer();
  }
}
