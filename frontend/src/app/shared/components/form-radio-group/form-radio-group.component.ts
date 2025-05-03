import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-form-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{label}}</label>

      <div class="flex items-center">
        <ng-container *ngFor="let option of options; let i = index">
          <label class="inline-flex items-center" [class.mr-6]="i < options.length - 1">
            <input
              type="radio"
              [formControl]="control"
              [value]="option.value"
              class="h-4 w-4 text-blue-600">
            <span class="ml-2">{{option.label}}</span>
          </label>
        </ng-container>
      </div>
    </div>
  `,
})
export class FormRadioGroupComponent implements OnInit{
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() label: string = '';
  @Input() options: { label: string, value: any }[] = [];

  control: FormControl = new FormControl('');
  private destroy$ = new Subject<void>();

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
