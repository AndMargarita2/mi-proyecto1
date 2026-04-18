import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'outlined';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article 
      [class.default]="variant === 'default'" 
      [class.elevated]="variant === 'elevated'" 
      [class.outlined]="variant === 'outlined'" 
      [class.clickable]="clickable"
    >
      <ng-content></ng-content>
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }

    article {
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .default {
      background-color: white;
      border: 1px solid #e5e7eb;
    }

    .default:hover {
      border-color: #d1d5db;
    }

    .elevated {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .elevated:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .outlined {
      background-color: transparent;
      border: 2px solid #2563eb;
    }

    .clickable {
      cursor: pointer;
    }

    .clickable.default:hover,
    .clickable.elevated:hover,
    .clickable.outlined:hover {
      transform: translateY(-4px);
    }
  `]
})
export class CardComponent {
  @Input() variant: CardVariant = 'elevated';
  @Input() clickable = false;
}
