import { AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const valid = hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  return valid ? null : { weakPassword: true }
}
