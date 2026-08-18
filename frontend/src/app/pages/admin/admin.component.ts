import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { CardComponent } from '../../components/card.component';
import { AuthService } from '../../services/auth.service';
import { AdminService, PendingUser } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ButtonComponent, CardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private readonly adminSvc = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly auth = inject(AuthService);

  protected solicitudes: PendingUser[] = [];
  protected loading = true;
  protected busyId: number | null = null;
  protected errorMessage = '';

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  private loadSolicitudes(): void {
    this.loading = true;
    this.adminSvc.listSolicitudes().subscribe({
      next: items => {
        this.solicitudes = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar las solicitudes.';
        this.cdr.markForCheck();
      }
    });
  }

  aprobar(user: PendingUser): void {
    this.busyId = user.id;
    this.adminSvc.aprobar(user.id).subscribe({
      next: () => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== user.id);
        this.busyId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.busyId = null;
        this.errorMessage = 'No se pudo aprobar la solicitud.';
        this.cdr.markForCheck();
      }
    });
  }

  rechazar(user: PendingUser): void {
    if (!confirm(`¿Rechazar la solicitud de ${user.displayName} (${user.email})?`)) return;
    this.busyId = user.id;
    this.adminSvc.rechazar(user.id).subscribe({
      next: () => {
        this.solicitudes = this.solicitudes.filter(s => s.id !== user.id);
        this.busyId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.busyId = null;
        this.errorMessage = 'No se pudo rechazar la solicitud.';
        this.cdr.markForCheck();
      }
    });
  }
}
