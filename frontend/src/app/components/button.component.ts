import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <button 
      [routerLink]="routerLink"
      [class.primary]="variant === 'primary'"
      [class.secondary]="variant === 'secondary'"
      [class.danger]="variant === 'danger'"
      [class.ghost]="variant === 'ghost'"
      [class.sm]="size === 'sm'"
      [class.md]="size === 'md'"
      [class.lg]="size === 'lg'"
      [class.full-width]="fullWidth"
      [disabled]="disabled"
      (click)="onClick.emit()"
      [attr.aria-label]="ariaLabel"
      [attr.type]="type"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      font-family: inherit;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .primary {
      background-color: #2563eb;
      color: white;
    }

    .primary:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .secondary {
      background-color: #e5e7eb;
      color: #1f2937;
    }

    .secondary:hover:not(:disabled) {
      background-color: #d1d5db;
      transform: translateY(-2px);
    }

    .danger {
      background-color: #ef4444;
      color: white;
    }

    .danger:hover:not(:disabled) {
      background-color: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .ghost {
      background-color: transparent;
      color: #2563eb;
      border: 1px solid #2563eb;
    }

    .ghost:hover:not(:disabled) {
      background-color: #eff6ff;
    }

    .sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .md {
      padding: 10px 16px;
      font-size: 14px;
    }

    .lg {
      padding: 12px 20px;
      font-size: 16px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink: string | string[] | null = null;
  @Input() ariaLabel: string | null = null;
  @Output() onClick = new EventEmitter<void>();
}
