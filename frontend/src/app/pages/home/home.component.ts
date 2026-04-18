import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { CardComponent } from '../../components/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  protected readonly presentationCards = [
    { title: 'Como empezar a usar Linux' },
    { title: 'Procesadores: ARM vs x86' },
    { title: 'Rendimiento para developers' }
  ];

  protected readonly highlights = [
    { title: 'Facil de crear' },
    { title: 'Acceso desde cualquier lugar' },
    { title: 'Seguridad y proteccion de datos' }
  ];
}
