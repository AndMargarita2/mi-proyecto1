import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { CardComponent } from '../../components/card.component';
import { SelectComponent, SelectOption } from '../../components/select.component';

interface CatalogItem {
  title: string;
  author: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, CardComponent, SelectComponent],
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

  protected categoryOptions: SelectOption[] = [
    { value: 'all', label: 'Todas las categorias' },
    { value: 'tech', label: 'Tecnologia' },
    { value: 'business', label: 'Negocios' },
    { value: 'education', label: 'Educacion' }
  ];

  protected sortOptions: SelectOption[] = [
    { value: 'recent', label: 'Mas recientes' },
    { value: 'popular', label: 'Mas populares' },
    { value: 'name', label: 'Por nombre' }
  ];

  protected selectedCategory: string | number = 'all';
  protected selectedSort: string | number = 'recent';

  onCategoryChange(value: string | number): void {
    this.selectedCategory = value;
  }

  onSortChange(value: string | number): void {
    this.selectedSort = value;
  }
}
