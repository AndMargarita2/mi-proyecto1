import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
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
