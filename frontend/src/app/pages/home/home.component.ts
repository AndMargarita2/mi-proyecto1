import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header.component';
import { ButtonComponent } from '../../components/button.component';
import { CardComponent } from '../../components/card.component';
import { LoginModalComponent } from '../../components/login-modal.component';
import { AuthService } from '../../services/auth.service';
import { PresentationsService, PresentationSummary } from '../../services/presentations.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    ButtonComponent,
    CardComponent,
    LoginModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly presentationsSvc = inject(PresentationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly auth = inject(AuthService);

  protected myPresentations: PresentationSummary[] = [];
  protected otherPresentations: PresentationSummary[] = [];
  protected loading = true;
  protected loginModalOpen = false;
  protected menuOpen = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('login') === '1') {
        this.loginModalOpen = true;
        this.cdr.markForCheck();
      }
    });

    void this.loadPresentations();
  }

  private async loadPresentations(): Promise<void> {
    // Evita que, justo tras un refresh, tus propias presentaciones aparezcan
    // un instante como "de la comunidad" mientras se restaura la sesión.
    await this.auth.waitUntilReady();
    this.presentationsSvc.list().subscribe(all => {
      const me = this.auth.currentUser;
      this.myPresentations = me ? all.filter(p => p.ownerId === me.id) : [];
      this.otherPresentations = me ? all.filter(p => p.ownerId !== me.id) : all;
      this.loading = false;
      // App zoneless (sin zone.js): hay que avisarle a Angular que este
      // estado cambió fuera de un evento de plantilla.
      this.cdr.markForCheck();
    });
  }

  onLoginClick(): void {
    this.loginModalOpen = true;
  }

  onSearchSubmit(query: string): void {
    this.router.navigate(['/catalogo'], query ? { queryParams: { q: query } } : {});
  }

  onLogout(): void {
    this.auth.logout();
    this.loadPresentations();
  }

  onMenuLogout(): void {
    this.menuOpen = false;
    this.onLogout();
  }

  onLoginModalClosed(): void {
    this.loginModalOpen = false;
    if (this.route.snapshot.queryParamMap.get('login')) {
      this.router.navigate([], { queryParams: {} });
    }
  }

  onAuthenticated(): void {
    this.onLoginModalClosed();
    this.loadPresentations();
  }

  openPresentation(item: PresentationSummary): void {
    this.router.navigate(['/crear-presentacion', item.id]);
  }

  /** Desplaza el carrusel una "página" (ancho visible) hacia adelante o atrás. */
  scrollTrack(track: HTMLElement, direction: 1 | -1): void {
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  }
}
