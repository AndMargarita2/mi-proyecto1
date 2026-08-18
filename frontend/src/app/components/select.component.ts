import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-wrapper" #selectWrapper>
      <button 
        class="select-trigger"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen"
        [attr.aria-label]="ariaLabel"
      >
        <span class="trigger-text">{{ selectedLabel }}</span>
        <span class="arrow" [class.open]="isOpen">▼</span>
      </button>

      <div *ngIf="isOpen" class="dropdown">
        <button
          *ngFor="let option of options"
          class="dropdown-item"
          [class.selected]="option.value === selectedValue"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .select-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    .select-trigger {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.35));
      border-radius: 8px;
      background-color: var(--color-surface, #0f172a);
      color: var(--color-text, #ecf2ff);
      font-size: 14px;
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    }

    .select-trigger:hover {
      border-color: rgba(148, 163, 184, 0.55);
    }

    .select-trigger:focus {
      outline: none;
      border-color: var(--color-accent-from, #2563eb);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
    }

    .arrow {
      font-size: 10px;
      transition: transform 0.2s ease;
      color: var(--color-text-muted, #94a3b8);
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--color-surface, #0f172a);
      border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.35));
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
      z-index: 10;
      overflow: hidden;
      margin-top: -1px;
    }

    .dropdown-item {
      width: 100%;
      padding: 10px 12px;
      border: none;
      background-color: transparent;
      color: var(--color-text, #ecf2ff);
      text-align: left;
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }

    .dropdown-item.selected {
      background-color: rgba(37, 99, 235, 0.18);
      color: var(--color-link, #93c5fd);
      font-weight: 600;
    }
  `]
})
export class SelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() selectedValue: string | number | null = null;
  @Input() placeholder = 'Selecciona una opcion';
  @Input() ariaLabel: string | null = null;
  @Output() valueChange = new EventEmitter<string | number>();

  @ViewChild('selectWrapper') selectWrapper!: ElementRef;

  isOpen = false;

  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.selectedValue);
    return selected?.label || this.placeholder;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SelectOption): void {
    this.selectedValue = option.value;
    this.valueChange.emit(option.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.selectWrapper && !this.selectWrapper.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
