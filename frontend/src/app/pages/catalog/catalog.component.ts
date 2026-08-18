import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { CardComponent } from '../../components/card.component';
import { SelectComponent, SelectOption } from '../../components/select.component';
import { LoginModalComponent } from '../../components/login-modal.component';
import { AuthService } from '../../services/auth.service';
import { PresentationsService, PresentationSummary } from '../../services/presentations.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    ButtonComponent,
    CardComponent,
    SelectComponent,
    LoginModalComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly presentationsSvc = inject(PresentationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly auth = inject(AuthService);

  protected items: PresentationSummary[] = [];
  protected filteredItems: PresentationSummary[] = [];
  protected loading = true;
  protected loginModalOpen = false;
  protected menuOpen = false;

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

  protected currentQuery = '';

  ngOnInit(): void {
    this.presentationsSvc.list().subscribe(items => {
      this.items = items;
      this.loading = false;
      this.applyFilter(this.route.snapshot.queryParamMap.get('q'));
      this.cdr.markForCheck();
    });

    this.route.queryParamMap.subscribe(params => {
      this.applyFilter(params.get('q'));
      this.cdr.markForCheck();
    });
  }

  private applyFilter(rawQuery: string | null): void {
    const q = (rawQuery ?? '').trim().toLowerCase();
    this.currentQuery = q;
    let base = !q
      ? this.items
      : this.items.filter(
          i => i.title.toLowerCase().includes(q) || i.ownerName.toLowerCase().includes(q)
        );
    if (this.selectedCategory !== 'all') {
      base = base.filter(i => i.category === this.selectedCategory);
    }
    this.filteredItems = this.sortItems(base);
  }

  private sortItems(items: PresentationSummary[]): PresentationSummary[] {
    const sorted = [...items];
    if (this.selectedSort === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // 'recent' y 'popular' (sin métrica de popularidad todavía) usan la fecha
      // de actualización más reciente primero, que es lo que ya devuelve el backend.
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return sorted;
  }

  onSearchSubmit(query: string): void {
    this.router.navigate([], { queryParams: query ? { q: query } : {} });
  }

  isOwner(item: PresentationSummary): boolean {
    return this.auth.currentUser?.id === item.ownerId;
  }

  onCategoryChange(value: string | number): void {
    this.selectedCategory = value;
    this.applyFilter(this.currentQuery);
  }

  onSortChange(value: string | number): void {
    this.selectedSort = value;
    this.filteredItems = this.sortItems(this.filteredItems);
  }

  onUserClick(): void {
    if (!this.auth.isLoggedIn) this.loginModalOpen = true;
  }

  onLogout(): void {
    this.auth.logout();
  }

  onMenuLogout(): void {
    this.menuOpen = false;
    this.onLogout();
  }

  onVer(item: PresentationSummary): void {
    this.router.navigate(['/crear-presentacion', item.id]);
  }

  onEditar(item: PresentationSummary): void {
    this.router.navigate(['/crear-presentacion', item.id]);
  }

  onBorrar(item: PresentationSummary): void {
    if (!confirm(`¿Borrar "${item.title}"? Esta acción no se puede deshacer.`)) return;
    this.presentationsSvc.delete(item.id).subscribe(() => {
      this.items = this.items.filter(i => i.id !== item.id);
      this.filteredItems = this.filteredItems.filter(i => i.id !== item.id);
      this.cdr.markForCheck();
    });
  }
}
