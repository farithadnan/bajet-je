import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="password" class="mt-2">
      <!-- Strength bars -->
      <div class="flex space-x-1 mb-1">
        <div class="h-1 flex-1 rounded" [ngClass]="{
          'bg-red-400': strength === 1,
          'bg-yellow-400': strength === 2,
          'bg-orange-400': strength === 3,
          'bg-green-400': strength === 4
        }"></div>
        <div class="h-1 flex-1 rounded" [ngClass]="{
          'bg-gray-200': strength < 2,
          'bg-yellow-400': strength === 2,
          'bg-orange-400': strength === 3,
          'bg-green-400': strength === 4
        }"></div>
        <div class="h-1 flex-1 rounded" [ngClass]="{
          'bg-gray-200': strength < 3,
          'bg-orange-400': strength === 3,
          'bg-green-400': strength === 4
        }"></div>
        <div class="h-1 flex-1 rounded" [ngClass]="{
          'bg-gray-200': strength < 4,
          'bg-green-400': strength === 4
        }"></div>
      </div>

      <!-- Strength text -->
      <div class="text-xs" [ngClass]="{
        'text-red-500': strength === 1,
        'text-yellow-600': strength === 2,
        'text-orange-600': strength === 3,
        'text-green-600': strength === 4
      }">
        <span *ngIf="strength === 1">Weak</span>
        <span *ngIf="strength === 2">Fair</span>
        <span *ngIf="strength === 3">Good</span>
        <span *ngIf="strength === 4">Strong</span>
      </div>

      <!-- Helper text -->
      <div *ngIf="showHints" class="text-xs text-gray-600 mt-1">
        {{ hintText }}
      </div>
    </div>
  `,
})
export class PasswordStrengthComponent implements OnChanges{
  @Input() password: string = '';
  @Input() showHints: boolean = true;
  @Input() hintText: string = 'Password should contain at least 8 characters, uppercase, number, and special character';

  strength: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['password']) {
      this.calculateStrength();
    }
  }

  private calculateStrength(): void {
    if (!this.password) {
      this.strength = 0;
      return;
    }

    let score = 0;

    // Length check
    if (this.password.length >= 8) score++;

    // Contains uppercase
    if (/[A-Z]/.test(this.password)) score++;

    // Contains number
    if (/[0-9]/.test(this.password)) score++;

    // Contains special character
    if (/[^A-Za-z0-9]/.test(this.password)) score++;

    this.strength = score;
  }
}
