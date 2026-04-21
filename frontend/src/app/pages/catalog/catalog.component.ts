import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
export class CatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

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
  protected filteredItems: CatalogItem[] = [];

  ngOnInit(): void {
    this.filteredItems = this.items;
    this.route.queryParamMap.subscribe(params => {
      const q = (params.get('q') ?? '').trim().toLowerCase();
      if (!q) {
        this.filteredItems = this.items;
        return;
      }
      this.filteredItems = this.items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.author.toLowerCase().includes(q)
      );
    });
  }

  onCategoryChange(value: string | number): void {
    this.selectedCategory = value;
  }

  onSortChange(value: string | number): void {
    this.selectedSort = value;
  }
}
