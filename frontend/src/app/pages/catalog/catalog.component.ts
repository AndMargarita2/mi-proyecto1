import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CatalogItem {
  title: string;
  author: string;
}

@Component({
  selector: 'app-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {
  protected readonly items: CatalogItem[] = [
    { title: 'Como empezar a usar Linux', author: 'Equipo Tecnologia' },
    { title: 'Procesadores ARM vs x86', author: 'Daniel Ortega' },
    { title: 'Arquitectura de software', author: 'C. Navarro' },
    { title: 'CPU vs GPU', author: 'Laboratorio TI' },
    { title: 'Presentacion en progreso', author: 'Sin autor' },
    { title: 'Seguridad informatica', author: 'Maria P.' }
  ];
}
