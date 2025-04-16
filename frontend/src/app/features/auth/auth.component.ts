import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../../shared/directives/autofocus.directive';
import { passwordStrengthValidator } from '../../shared/validators/password-strength.validator';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toastr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutoFocusDirective
  ],
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  showPassword = false;
  isLoginMode = true;
  isLoading = false;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.updateFormFields();

    this.authService.initializeUserData();
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  updateFormFields(): void {
    const hasUsername = this.authForm.contains('username');
    const hasRememberMe = this.authForm.contains('rememberMe');
    const passwordControl = this.authForm.get('password');

    if (passwordControl) {
      const baseValidators = [Validators.required, Validators.minLength(8)];

      if (!this.isLoginMode) {
        passwordControl.setValidators([...baseValidators, passwordStrengthValidator]);
      } else {
        passwordControl.setValidators(baseValidators);
      }

      passwordControl.updateValueAndValidity();
    }

    if (!this.isLoginMode && !hasUsername) {
      this.authForm.addControl('username', this.fb.control('', [
        Validators.required,
        Validators.minLength(5)
      ]));

      if (hasRememberMe) {
        this.authForm.removeControl('rememberMe');
      }
    }
    else if (this.isLoginMode && hasUsername) {
      this.authForm.removeControl('username');

      if (!hasRememberMe) {
        this.authForm.addControl('rememberMe', this.fb.control(false));
      }
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.updateFormFields();
    this.authForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrength(): number {
    const password = this.authForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  }

  getInputClasses(controlName: string): string {
    const control = this.authForm.get(controlName);
    const isInvalid = control?.invalid && control?.touched;

    const baseClasses = 'w-full border p-2 rounded transition-all duration-200 outline-none';
    const validClasses = 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const invalidClasses = 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500';

    return `${baseClasses} ${isInvalid ? invalidClasses : validClasses}`;
  }

  onBlur(controlName: string): void {
    const control = this.authForm.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.authForm.value;

    if (this.isLoginMode) {
      const loginData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      };
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.show('success', 'Login successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.show('error', 'Login failed', error.message);
        }
      });
    }
    else {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.show('success', 'Account created successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this.toastService.show('error', 'Register failed', error.message);
        }
      });
    }
  }
}
