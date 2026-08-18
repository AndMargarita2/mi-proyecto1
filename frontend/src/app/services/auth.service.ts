import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentUser {
  id: number;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

interface UserOutDto {
  id: number;
  email: string;
  display_name: string;
  is_admin: boolean;
}

interface TokenResponseDto {
  access_token: string;
  token_type: string;
  user: UserOutDto;
}

interface AccessRequestResponseDto {
  mensaje: string;
}

const LS_TOKEN_KEY = 'mp_auth_token';

function toCurrentUser(dto: UserOutDto): CurrentUser {
  return { id: dto.id, email: dto.email, displayName: dto.display_name, isAdmin: dto.is_admin };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  // Esta app corre sin zone.js (change detection zoneless de Angular 21): un signal
  // hace que cualquier plantilla que lea currentUser/isLoggedIn se refresque sola
  // cuando cambia la sesión, sin necesitar ChangeDetectorRef en cada componente.
  private readonly currentUserSignal = signal<CurrentUser | null>(null);

  /**
   * Se resuelve cuando termina el intento de restaurar sesión desde el token guardado
   * (o de inmediato si no hay token). authGuard espera esto antes de decidir, para que
   * una recarga directa a una ruta protegida no expulse a un usuario ya logueado.
   */
  private readonly ready: Promise<void>;

  constructor() {
    this.ready = this.restoreSession();
  }

  waitUntilReady(): Promise<void> {
    return this.ready;
  }

  get currentUser(): CurrentUser | null {
    return this.currentUserSignal();
  }

  get isLoggedIn(): boolean {
    return this.currentUserSignal() !== null;
  }

  get token(): string | null {
    return localStorage.getItem(LS_TOKEN_KEY);
  }

  /**
   * Manda una solicitud de acceso: NO crea sesión. El usuario queda "pending" hasta que
   * el maestro (admin) la aprueba desde /admin — recién ahí puede loguearse.
   */
  requestAccess(email: string, password: string, displayName: string): Observable<string> {
    return this.http
      .post<AccessRequestResponseDto>(`${this.base}/solicitar-acceso`, {
        email,
        password,
        display_name: displayName
      })
      .pipe(map(res => res.mensaje));
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<TokenResponseDto>(`${this.base}/login`, { email, password })
      .pipe(map(res => this.applySession(res)));
  }

  logout(): void {
    localStorage.removeItem(LS_TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  private applySession(res: TokenResponseDto): CurrentUser {
    localStorage.setItem(LS_TOKEN_KEY, res.access_token);
    const user = toCurrentUser(res.user);
    this.currentUserSignal.set(user);
    return user;
  }

  private restoreSession(): Promise<void> {
    const token = this.token;
    if (!token) return Promise.resolve();

    return new Promise<void>(resolve => {
      this.http
        .get<UserOutDto>(`${this.base}/me`)
        .pipe(
          map(toCurrentUser),
          catchError(() => {
            localStorage.removeItem(LS_TOKEN_KEY);
            return of(null);
          })
        )
        .subscribe(user => {
          this.currentUserSignal.set(user);
          resolve();
        });
    });
  }
}
