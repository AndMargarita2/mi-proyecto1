import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Slide } from '../models/slide.model';

export type PresentationCategory = 'tech' | 'business' | 'education';

export interface PresentationSummary {
  id: number;
  title: string;
  category: PresentationCategory;
  ownerId: number;
  ownerName: string;
  updatedAt: string;
}

export interface PresentationFull extends PresentationSummary {
  slides: Slide[];
  createdAt: string;
}

interface PresentationSummaryDto {
  id: number;
  title: string;
  category: PresentationCategory;
  owner_id: number;
  owner_name: string;
  updated_at: string;
}

interface PresentationFullDto extends PresentationSummaryDto {
  slides: Slide[];
  created_at: string;
}

function toSummary(dto: PresentationSummaryDto): PresentationSummary {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    ownerId: dto.owner_id,
    ownerName: dto.owner_name,
    updatedAt: dto.updated_at
  };
}

function toFull(dto: PresentationFullDto): PresentationFull {
  return { ...toSummary(dto), slides: dto.slides, createdAt: dto.created_at };
}

@Injectable({ providedIn: 'root' })
export class PresentationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/presentaciones`;

  list(): Observable<PresentationSummary[]> {
    return this.http
      .get<PresentationSummaryDto[]>(this.base)
      .pipe(map(items => items.map(toSummary)));
  }

  get(id: number): Observable<PresentationFull> {
    return this.http.get<PresentationFullDto>(`${this.base}/${id}`).pipe(map(toFull));
  }

  create(
    title: string,
    slides: Slide[],
    category: PresentationCategory = 'tech'
  ): Observable<PresentationFull> {
    return this.http
      .post<PresentationFullDto>(this.base, { title, category, slides })
      .pipe(map(toFull));
  }

  update(
    id: number,
    changes: { title?: string; slides?: Slide[]; category?: PresentationCategory }
  ): Observable<PresentationFull> {
    return this.http.put<PresentationFullDto>(`${this.base}/${id}`, changes).pipe(map(toFull));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
