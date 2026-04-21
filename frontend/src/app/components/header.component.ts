import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from './button.component';
import { InputComponent } from './input.component';

export type HeaderType = 'main' | 'catalog' | 'editor';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, InputComponent],
  template: `
    <header [class]="getHeaderClasses()">
      <!-- Main Header -->
      <ng-container *ngIf="type === 'main'">
        <button type="button" class="menu-btn" aria-label="Abrir menu" (click)="onMenuClick.emit()">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="logo">{{ logoText }}</div>
        <app-input 
          type="search"
          [placeholder]="searchPlaceholder"
          aria-label="Buscar proyecto"
        ></app-input>
        <app-button 
          variant="secondary"
          (onClick)="onLoginClick.emit()"
        >
          Iniciar sesion
        </app-button>
      </ng-container>

      <!-- Catalog Header -->
      <ng-container *ngIf="type === 'catalog'">
        <div class="left-group">
          <button type="button" class="menu-btn" aria-label="Abrir menu" (click)="onMenuClick.emit()">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div class="logo">{{ logoText }}</div>
          <h1>{{ title }}</h1>
        </div>
        <app-input 
          type="search"
          [placeholder]="searchPlaceholder"
          aria-label="Buscar en catalogo"
        ></app-input>
        <app-button 
          variant="secondary"
          size="sm"
          (onClick)="onUserClick.emit()"
        >
          usuario
        </app-button>
      </ng-container>

      <!-- Editor: barra principal + cinta (contenido proyectado) -->
      <ng-container *ngIf="type === 'editor'">
        <div class="editor-shell">
          <div class="editor-row-primary">
            <div class="editor-header-start">
              <input
                type="text"
                class="editor-title-input"
                name="editorPresentationTitle"
                [(ngModel)]="titleDraft"
                (ngModelChange)="onTitleDraftChange($event)"
                [placeholder]="titlePlaceholder"
                spellcheck="false"
                maxlength="120"
                aria-label="Nombre de la presentación"
              />
            </div>
            <div class="editor-header-end">
              <button
                type="button"
                class="mini-btn"
                aria-label="Menú del editor"
                [attr.aria-expanded]="menuExpanded"
                aria-controls="editor-slide-menu"
                (click)="onMenuClick.emit()"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <a [routerLink]="homeLink" class="editor-home-link" title="Ir al inicio" aria-label="Ir al inicio">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </a>
              <div class="editor-primary-actions-host">
                <ng-content select="[editorPrimaryActions]"></ng-content>
              </div>
              <app-button 
                variant="primary"
                size="sm"
                (onClick)="onPresentClick.emit()"
              >
                Presentar
              </app-button>
            </div>
          </div>
          <div class="editor-toolbar-row">
            <ng-content select="[editorToolbar]"></ng-content>
          </div>
        </div>
      </ng-container>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    header {
      padding: 16px 24px;
      background-color: #1f2937;
      border-bottom: 2px solid #2563eb;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    header.main-topbar {
      justify-content: space-between;
    }

    header.catalog-topbar {
      justify-content: flex-start;
      gap: 30px;
    }

    header.editor-topbar {
      padding: 0;
      gap: 0;
      flex-direction: column;
      align-items: stretch;
      border-bottom: none;
    }

    .editor-shell {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .editor-row-primary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(55, 65, 81, 0.9);
      overflow: visible;
    }

    .editor-primary-actions-host {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      overflow: visible;
    }

    .editor-toolbar-row {
      width: 100%;
      overflow: visible;
      background: #1e293b;
      border-bottom: 2px solid #2563eb;
    }

    .editor-toolbar-row:empty {
      display: none;
    }

    .editor-header-start {
      display: flex;
      align-items: center;
      min-width: 0;
      flex: 1 1 auto;
      max-width: min(560px, 58vw);
    }

    .editor-header-end {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 10px;
      flex-shrink: 0;
      min-width: 0;
      overflow: visible;
    }

    .menu-btn {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      transition: all 0.2s ease;
    }

    .menu-btn:hover span {
      background-color: #2563eb;
    }

    .menu-btn span {
      width: 24px;
      height: 2px;
      background-color: white;
      border-radius: 1px;
      transition: all 0.3s ease;
    }

    .mini-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      min-width: 40px;
      min-height: 40px;
      border-radius: 8px;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }

    .mini-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .mini-btn:hover span {
      background-color: #60a5fa;
    }

    .mini-btn span {
      display: block;
      width: 18px;
      height: 2px;
      background-color: #f8fafc;
      border-radius: 1px;
      flex-shrink: 0;
    }

    .editor-home-link {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      flex-shrink: 0;
      padding: 6px;
      border-radius: 8px;
      transition: color 0.2s ease, background 0.2s ease;
    }

    .editor-home-link:hover {
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.06);
    }

    .editor-title-input {
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
      font-size: 17px;
      font-weight: 600;
      color: #e0f2fe;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 8px;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .editor-title-input::placeholder {
      color: #64748b;
    }

    .editor-title-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);
    }

    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #2563eb;
      min-width: 45px;
      text-align: center;
      letter-spacing: -2px;
    }

    .left-group {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .left-group h1 {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    app-input {
      flex: 1;
      max-width: 600px;
      min-width: 200px;
    }

    ::ng-deep app-input input {
      padding: 12px 16px !important;
      font-size: 16px !important;
      background-color: #374151 !important;
      border-color: #4b5563 !important;
      color: white !important;
    }

    ::ng-deep app-input input::placeholder {
      color: #9ca3af !important;
    }

    ::ng-deep app-input input:focus {
      background-color: #4b5563 !important;
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
    }
  `]
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() type: HeaderType = 'main';
  @Input() logoText = 'D';
  @Input() title = '';
  @Input() titlePlaceholder = 'Nombre de la presentación';
  @Input() searchPlaceholder = 'Busca entre los proyectos...';
  @Input() homeLink = '/';
  /** Estado del panel lateral del editor (para aria-expanded del botón menú). */
  @Input() menuExpanded = false;
  @Output() onMenuClick = new EventEmitter<void>();
  @Output() onLoginClick = new EventEmitter<void>();
  @Output() onUserClick = new EventEmitter<void>();
  @Output() onPresentClick = new EventEmitter<void>();
  @Output() titleChange = new EventEmitter<string>();

  /** Borrador local del título (evita saltos del cursor con solo [value]). */
  titleDraft = '';

  ngOnInit(): void {
    this.titleDraft = this.title;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title'] && this.title !== this.titleDraft) {
      if (typeof document !== 'undefined') {
        const ae = document.activeElement;
        if (ae instanceof HTMLElement && ae.classList.contains('editor-title-input')) {
          return;
        }
      }
      this.titleDraft = this.title;
    }
  }

  onTitleDraftChange(value: string): void {
    this.titleChange.emit(value);
  }

  getHeaderClasses(): string {
    const base = `topbar ${this.type}-topbar`;
    return this.type === 'editor' ? `${base} editor-topbar-stacked` : base;
  }
}
