import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PendingUser {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

interface PendingUserDto {
  id: number;
  email: string;
  display_name: string;
  created_at: string;
}

function toPendingUser(dto: PendingUserDto): PendingUser {
  return { id: dto.id, email: dto.email, displayName: dto.display_name, createdAt: dto.created_at };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  listSolicitudes(): Observable<PendingUser[]> {
    return this.http
      .get<PendingUserDto[]>(`${this.base}/solicitudes`)
      .pipe(map(items => items.map(toPendingUser)));
  }

  aprobar(userId: number): Observable<PendingUser> {
    return this.http
      .post<PendingUserDto>(`${this.base}/solicitudes/${userId}/aprobar`, {})
      .pipe(map(toPendingUser));
  }

  rechazar(userId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/solicitudes/${userId}/rechazar`, {});
  }
}
