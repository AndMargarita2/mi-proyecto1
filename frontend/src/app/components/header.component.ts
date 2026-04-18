import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from './button.component';
import { InputComponent } from './input.component';

export type HeaderType = 'main' | 'catalog' | 'editor';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, InputComponent],
  template: `
    <header [class]="getHeaderClasses()">
      <!-- Main Header -->
      <ng-container *ngIf="type === 'main'">
        <button class="menu-btn" aria-label="Abrir menu" (click)="onMenuClick.emit()">
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
          <button class="menu-btn" aria-label="Abrir menu" (click)="onMenuClick.emit()">
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

      <!-- Editor Header -->
      <ng-container *ngIf="type === 'editor'">
        <button class="mini-btn" aria-label="Opciones" (click)="onMenuClick.emit()">
          <span></span>
          <span></span>
        </button>
        <a [routerLink]="homeLink" class="editor-title">{{ title }}</a>
        <div class="top-actions">
          <app-button 
            variant="primary"
            size="sm"
            (onClick)="onPresentClick.emit()"
          >
            Presentar
          </app-button>
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
      justify-content: space-between;
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
      gap: 3px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      transition: all 0.2s ease;
    }

    .mini-btn:hover span {
      background-color: #2563eb;
    }

    .mini-btn span {
      width: 16px;
      height: 2px;
      background-color: white;
      border-radius: 1px;
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

    .editor-title {
      font-size: 18px;
      font-weight: 600;
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .editor-title:hover {
      color: #93c5fd;
    }

    .top-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
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
export class HeaderComponent {
  @Input() type: HeaderType = 'main';
  @Input() logoText = 'D';
  @Input() title = '';
  @Input() searchPlaceholder = 'Busca entre los proyectos...';
  @Input() homeLink = '/';
  @Output() onMenuClick = new EventEmitter<void>();
  @Output() onLoginClick = new EventEmitter<void>();
  @Output() onUserClick = new EventEmitter<void>();
  @Output() onPresentClick = new EventEmitter<void>();

  getHeaderClasses(): string {
    return `topbar ${this.type}-topbar`;
  }
}
