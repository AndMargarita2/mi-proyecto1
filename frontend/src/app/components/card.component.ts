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
      background-color: var(--color-surface, #0f172a);
      border: 1px solid var(--color-border, rgba(51, 65, 85, 0.85));
    }

    .default:hover {
      border-color: var(--color-border-subtle, rgba(148, 163, 184, 0.35));
    }

    .elevated {
      background-color: var(--color-surface, #0f172a);
      border: 1px solid var(--color-border, rgba(51, 65, 85, 0.85));
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }

    .elevated:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    }

    .outlined {
      background-color: transparent;
      border: 2px solid var(--color-accent-from, #2563eb);
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
