import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-wrapper">
      <input
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [attr.aria-label]="ariaLabel"
        [class.error]="hasError"
      />
      <div *ngIf="helperText" class="helper-text" [class.error]="hasError">
        {{ helperText }}
      </div>
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }

    input {
      padding: 10px 12px;
      border: 1px solid var(--color-border-subtle, rgba(148, 163, 184, 0.35));
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s ease;
      background-color: var(--color-surface-raised, rgba(15, 23, 42, 0.75));
      color: var(--color-text, #ecf2ff);
    }

    input::placeholder {
      color: var(--color-text-muted, #64748b);
    }

    input:focus {
      outline: none;
      border-color: var(--color-accent-from, #2563eb);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
    }

    input:disabled {
      background-color: rgba(255, 255, 255, 0.04);
      color: var(--color-text-muted, #64748b);
      cursor: not-allowed;
    }

    input.error {
      border-color: var(--color-danger, #ef4444);
    }

    input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .helper-text {
      font-size: 12px;
      color: var(--color-text-muted, #94a3b8);
    }

    .helper-text.error {
      color: var(--color-danger, #f87171);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() hasError = false;
  @Input() helperText = '';
  @Input() ariaLabel: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  value = '';

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onBlur(): void {
    this.onTouched();
  }
}
