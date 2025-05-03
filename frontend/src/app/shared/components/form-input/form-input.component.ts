import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordStrengthComponent } from '../password-strength/password-strength.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordStrengthComponent],
  template: `
      <div class="mb-4">
      <label [for]="id" class="block text-sm font-medium text-gray-700 mb-1">{{label}}</label>

      <div class="relative">
        <input
          [type]="showPassword && type === 'password' ? 'text' : type"
          [id]="id"
          [formControl]="control"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          [placeholder]="placeholder"
        >

        <!-- Show/Hide Password toggle for password fields -->
        <button
          *ngIf="type === 'password' && togglePassword"
          type="button"
          class="absolute right-3 top-2.5 text-gray-600 focus:outline-none"
          (click)="togglePasswordVisibility()"
          tabindex="-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-5 h-5">
            <path *ngIf="!showPassword" stroke-linecap="round" stroke-linejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path *ngIf="!showPassword" stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />

            <path *ngIf="showPassword" stroke-linecap="round" stroke-linejoin="round"
              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>

      <!-- Password strength meter (only for password fields with showStrength enabled) -->
      <ng-container *ngIf="type === 'password' && showStrength">
        <app-password-strength
          [password]="control.value"
          [showHints]="showStrengthHints"
          [hintText]="strengthHintText">
        </app-password-strength>
      </ng-container>

      <!-- Validation errors -->
      <div *ngIf="control.invalid && control.touched"
        class="text-red-600 text-sm mt-1">
        <span *ngIf="control.errors?.['required']">{{label}} is required</span>
        <span *ngIf="control.errors?.['minlength']">
          {{label}} must be at least {{control.errors?.['minlength'].requiredLength}} characters
        </span>
        <span *ngIf="control.errors?.['email']">Please enter a valid email</span>
        <span *ngIf="control.errors?.['pattern']">{{label}} format is invalid</span>
        <!-- Add other validations as needed -->
      </div>
    </div>
  `,
})
export class FormInputComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() placeholder: string = '';

  // Password specific inputs
  @Input() togglePassword: boolean = true;
  @Input() showStrength: boolean = false;
  @Input() showStrengthHints: boolean = true;
  @Input() strengthHintText: string = 'Password should contain at least 8 characters, uppercase, number, and special character';

  showPassword: boolean = false;
  control: FormControl = new FormControl('');
  private destroy$ = new Subject<void>();


  ngOnInit() {
    if (this.parentForm && this.controlName) {
      // Delay access to the control until next change detection cycle
      setTimeout(() => {
        this.control = this.parentForm.get(this.controlName) as FormControl;

        if (!this.control) {
          console.error(`Form control '${this.controlName}' not found in parent form`);
          // Create a dummy control to prevent errors
          this.control = new FormControl('');
        }
      });
    } else {
      console.error('Parent form or control name is missing');
      this.control = new FormControl('');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
