import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label [for]="id" class="block text-sm font-medium text-gray-700 mb-1">{{label}}</label>

      <select
        [id]="id"
        [formControl]="control"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

        <option *ngFor="let option of options" [value]="option.value">
          {{option.label}}
        </option>
      </select>

      <div *ngIf="control?.invalid && control?.touched"
        class="text-red-600 text-sm mt-1">
        <span *ngIf="control?.errors?.['required']">{{label}} is required</span>
      </div>
    </div>
  `,
})
export class FormSelectComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() options: { label: string, value: any }[] = [];

  control!: FormControl;

  ngOnInit() {
    if (this.parentForm && this.controlName) {
      setTimeout(() => {
        const ctrl = this.parentForm.get(this.controlName);
        if (ctrl) {
          this.control = ctrl as FormControl;
        } else {
          console.error(`Form control '${this.controlName}' not found in parent form at runtime`);
          this.control = new FormControl('');
        }
      });
    } else {
      console.error('Parent form or control name is missing');
      this.control = new FormControl('');
    }
  }
}
