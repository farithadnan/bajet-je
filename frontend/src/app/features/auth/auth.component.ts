import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AutoFocusDirective } from '../../shared/directives/autofocus.directive';

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
  showPassword = true;
  isLoginMode = true;

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.updateFormFields();
  }

  updateFormFields(): void {
    const hasUsername = this.authForm.contains('username');
    const hasRememberMe = this.authForm.contains('rememberMe');

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

  onBlur(controlName: string): void {
    const control = this.authForm.get(controlName);
    if (control) {
      control.markAsTouched();
    } else {
      console.log('noob');
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const formData = this.authForm.value;

    if (this.isLoginMode) {
      const loginData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      };
      console.log('Login with:', loginData);

      // call service
    }
    else {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      console.log('Register with:', registerData);

      // Call your auth service register method here
    }
  }
}
