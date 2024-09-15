import { Component, OnInit } from '@angular/core';  
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Importar FormsModule aquí
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

@Component({
  selector: 'app-menu',
  standalone: true,  // Standalone component
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  imports: [CommonModule, FormsModule]  // Importar FormsModule para usar ngModel
})
export class MenuComponent implements OnInit {
  menuOpen = false;
  currentImageIndex: number = 0;
  totalImages: number = 0;
  images: any;

  // Para el modal
  isModalVisible: boolean = false; // Controla la visibilidad del modal
  userName: string = ''; // Almacena el nombre del usuario

  constructor(private router: Router) {}

  // Método para abrir o cerrar el menú
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Método para navegar a una ruta
  navigateTo(route: string) {
    this.router.navigate([route]);
    this.menuOpen = false;
  }

  // Método ngOnInit que se ejecuta al cargar el componente
  ngOnInit() {
    // Seleccionamos todas las imágenes del carrusel usando querySelectorAll
    this.images = document.querySelectorAll('.carousel-image');
    this.totalImages = this.images.length;

    // Cambiar la imagen cada 4 segundos
    setInterval(() => {
      this.showNextImage();
    }, 4000);
  }

  // Método para mostrar la siguiente imagen del carrusel
  showNextImage() {
    this.images[this.currentImageIndex].classList.remove('active');  // Quitamos la clase 'active' de la imagen actual
    this.currentImageIndex = (this.currentImageIndex + 1) % this.totalImages;  // Calculamos el índice de la siguiente imagen
    this.images[this.currentImageIndex].classList.add('active');  // Añadimos la clase 'active' a la siguiente imagen
  }

  // Funcionalidad para el modal
  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  // Método para manejar el envío del nombre
  submitName() {
    if (this.userName.trim() !== '') {
      console.log('Nombre del usuario:', this.userName);
      this.isModalVisible = false; // Cerrar el modal
      // Aquí puedes redirigir a otra página o almacenar el nombre en algún servicio
      this.router.navigate(['/menu-estudiante'], { queryParams: { name: this.userName } }); // Redirige a la siguiente página con el nombre como parámetro
    } else {
      // Usamos SweetAlert para mostrar una alerta si el nombre está vacío
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Por favor, ingrese su nombre antes de continuar.'
      });
    }
  }
}
