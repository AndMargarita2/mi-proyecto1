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
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background-color: white;
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
      border-color: #9ca3af;
    }

    .select-trigger:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .arrow {
      font-size: 10px;
      transition: transform 0.2s ease;
      color: #6b7280;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: white;
      border: 1px solid #d1d5db;
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      z-index: 10;
      overflow: hidden;
      margin-top: -1px;
    }

    .dropdown-item {
      width: 100%;
      padding: 10px 12px;
      border: none;
      background-color: transparent;
      text-align: left;
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .dropdown-item:hover {
      background-color: #f3f4f6;
    }

    .dropdown-item.selected {
      background-color: #eff6ff;
      color: #2563eb;
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
