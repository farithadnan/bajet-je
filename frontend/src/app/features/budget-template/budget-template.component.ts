import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-budget-template',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent,
    FormInputComponent
  ],
  templateUrl: './budget-template.component.html',
  styleUrl: './budget-template.component.css'
})
export class BudgetTemplateComponent implements OnInit {

  constructor() {

  }

  ngOnInit(): void {

  }

}
