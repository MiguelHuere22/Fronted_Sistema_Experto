import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-paciente',
  standalone: true,
  templateUrl: './registrar-paciente.component.html',
  styleUrls: ['./registrar-paciente.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RegistrarPacienteComponent {
  formData = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    ubigeo: '',
    sexo: '',
    telefono: '',
    fechaNacimiento: '',
    username: '',
    password: '',
    rol: 'Paciente'  // Asegúrate de que el rol es 'Paciente'
  };

  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (this.isFormInvalid()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos'
      });
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    console.log('Datos enviados:', this.formData);

    this.authService.registrarPersonaYUsuario(this.formData).subscribe(response => {
      if (response.status_code === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: '¡Paciente registrado exitosamente!'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el paciente'
        });
      }
    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error.msg || 'Ocurrió un error al registrar el paciente'
      });
    });
  }

  isFormInvalid(): boolean {
    return Object.values(this.formData).some(value => !value) || !this.confirmPassword;
  }

  onBack(): void {
    this.router.navigate(['/login']);
  }
}
