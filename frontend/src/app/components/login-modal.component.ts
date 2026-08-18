import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from './button.component';
import { InputComponent } from './input.component';
import { AuthService } from '../services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div *ngIf="open" class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="close()">
          &times;
        </button>

        <div class="modal-badge">D</div>

        <ng-container *ngIf="mode === 'login'; else requestAccessBlock">
          <h2>Iniciar sesión</h2>

          <form (ngSubmit)="submit()">
            <div class="field">
              <label for="login-modal-email">Correo</label>
              <app-input
                id="login-modal-email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                [(ngModel)]="email"
                name="email"
                ariaLabel="Correo"
              ></app-input>
            </div>

            <div class="field">
              <label for="login-modal-password">Contraseña</label>
              <app-input
                id="login-modal-password"
                type="password"
                placeholder="••••••••"
                [(ngModel)]="password"
                name="password"
                ariaLabel="Contraseña"
                [hasError]="!!errorMessage"
                [helperText]="errorMessage"
              ></app-input>
            </div>

            <app-button type="submit" variant="pill" [fullWidth]="true" [disabled]="submitting">
              {{ submitting ? 'Entrando…' : 'Entrar' }}
            </app-button>
          </form>

          <button type="button" class="mode-toggle" (click)="toggleMode()">
            ¿No tienes cuenta? <span>Solicita acceso</span>
          </button>
        </ng-container>

        <ng-template #requestAccessBlock>
          <ng-container *ngIf="!requestSent; else requestSentBlock">
            <h2>Solicitar acceso</h2>
            <p class="hint-text">
              Tu solicitud llega al maestro (admin de la plataforma). Cuando la apruebe podrás
              iniciar sesión.
            </p>

            <form (ngSubmit)="submit()">
              <div class="field">
                <label for="login-modal-name">Nombre</label>
                <app-input
                  id="login-modal-name"
                  type="text"
                  placeholder="Tu nombre"
                  [(ngModel)]="displayName"
                  name="displayName"
                  ariaLabel="Nombre"
                ></app-input>
              </div>

              <div class="field">
                <label for="login-modal-request-email">Correo</label>
                <app-input
                  id="login-modal-request-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  [(ngModel)]="email"
                  name="email"
                  ariaLabel="Correo"
                ></app-input>
              </div>

              <div class="field">
                <label for="login-modal-request-password">Contraseña</label>
                <app-input
                  id="login-modal-request-password"
                  type="password"
                  placeholder="••••••••"
                  [(ngModel)]="password"
                  name="password"
                  ariaLabel="Contraseña"
                  [hasError]="!!errorMessage"
                  [helperText]="errorMessage"
                ></app-input>
              </div>

              <app-button type="submit" variant="pill" [fullWidth]="true" [disabled]="submitting">
                {{ submitting ? 'Enviando…' : 'Solicitar acceso' }}
              </app-button>
            </form>

            <button type="button" class="mode-toggle" (click)="toggleMode()">
              ¿Ya tienes cuenta? <span>Inicia sesión</span>
            </button>
          </ng-container>

          <ng-template #requestSentBlock>
            <h2>Solicitud enviada</h2>
            <p class="hint-text">{{ requestSentMessage }}</p>
            <app-button variant="pill" [fullWidth]="true" (onClick)="close()">
              Entendido
            </app-button>
          </ng-template>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(4, 9, 19, 0.72);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal-card {
      width: 100%;
      max-width: 360px;
      padding: 32px 24px 26px;
      position: relative;
      border-radius: 16px;
      background: linear-gradient(165deg, rgba(13, 30, 48, 0.98), rgba(9, 12, 26, 0.98));
      border: 1px solid rgba(88, 144, 217, 0.4);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    }

    .modal-badge {
      width: 2.4rem;
      height: 2.4rem;
      margin: 0 auto 14px;
      border: 2px solid rgba(88, 144, 217, 0.65);
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 1.15rem;
      color: #93c5fd;
    }

    .modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      background: none;
      border: none;
      border-radius: 999px;
      font-size: 20px;
      line-height: 1;
      color: #94a3b8;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .modal-close:hover {
      color: #e2e8f0;
      background: rgba(148, 163, 184, 0.15);
    }

    h2 {
      margin: 0 0 18px;
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      color: #ecf2ff;
    }

    .hint-text {
      margin: -8px 0 18px;
      font-size: 13px;
      color: #9aa8bd;
      line-height: 1.45;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    label {
      font-size: 12.5px;
      font-weight: 600;
      color: #b6c2d9;
    }

    ::ng-deep .modal-card app-input input {
      background-color: rgba(15, 23, 42, 0.75) !important;
      border: 1px solid rgba(131, 157, 199, 0.3) !important;
      color: #ecf2ff !important;
    }

    ::ng-deep .modal-card app-input input::placeholder {
      color: #64748b !important;
    }

    ::ng-deep .modal-card app-input input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25) !important;
    }

    ::ng-deep .modal-card app-input input.error {
      border-color: #f87171 !important;
    }

    ::ng-deep .modal-card app-input .helper-text {
      color: #94a3b8;
    }

    ::ng-deep .modal-card app-input .helper-text.error {
      color: #f87171;
    }

    .mode-toggle {
      margin-top: 18px;
      width: 100%;
      background: none;
      border: none;
      color: #9aa8bd;
      font-size: 13px;
      cursor: pointer;
      text-align: center;
    }

    .mode-toggle span {
      color: #93c5fd;
      font-weight: 600;
    }

    .mode-toggle:hover span {
      text-decoration: underline;
    }
  `]
})
export class LoginModalComponent {
  @Input() open = false;
  @Input() mode: AuthMode = 'login';
  @Output() closed = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<void>();

  protected email = '';
  protected password = '';
  protected displayName = '';
  protected errorMessage = '';
  protected submitting = false;
  protected requestSent = false;
  protected requestSentMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.errorMessage = '';
    this.requestSent = false;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  close(): void {
    this.errorMessage = '';
    this.submitting = false;
    this.requestSent = false;
    this.closed.emit();
  }

  submit(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Completa correo y contraseña.';
      return;
    }
    if (this.mode === 'register' && !this.displayName.trim()) {
      this.errorMessage = 'Ingresa tu nombre.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    if (this.mode === 'register') {
      this.auth.requestAccess(this.email.trim(), this.password, this.displayName.trim()).subscribe({
        next: mensaje => {
          this.submitting = false;
          this.resetFields();
          this.requestSent = true;
          this.requestSentMessage = mensaje;
          this.cdr.markForCheck();
        },
        error: err => {
          this.submitting = false;
          this.errorMessage = err?.error?.detail ?? 'No se pudo enviar la solicitud.';
          this.cdr.markForCheck();
        }
      });
      return;
    }

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.submitting = false;
        this.resetFields();
        this.authenticated.emit();
        this.cdr.markForCheck();
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail ?? 'No se pudo iniciar sesión.';
        this.cdr.markForCheck();
      }
    });
  }

  private resetFields(): void {
    this.email = '';
    this.password = '';
    this.displayName = '';
  }
}
