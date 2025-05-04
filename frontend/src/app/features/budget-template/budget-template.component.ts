import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { BudgetTemplate } from '../../core/models/budget-template.model';
import { ToastService } from '../../shared/services/toastr.service';
import { TableColumn, TableQueryFilter } from '../../shared/models/table.model';
import { BudgetTemplateService } from '../../shared/services/budget-template.service';
import { totalPercentageValidator } from '../../shared/validators/total-percentage.validator';
import { FormRadioGroupComponent } from '../../shared/components/form-radio-group/form-radio-group.component';

@Component({
  selector: 'app-budget-template',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent,
    FormInputComponent,
    FormRadioGroupComponent
  ],
  templateUrl: './budget-template.component.html',
  styleUrl: './budget-template.component.css'
})
export class BudgetTemplateComponent implements OnInit {
  tableColumns: TableColumn[] = [
    {
      header: 'Template Name',
      field: 'templateName',
      type: 'text'
    },
    {
      header: 'Created By',
      field: 'createdBy',
      type: 'avatar',
    },
    {
      header: 'Created Date',
      field: 'createdDate',
      type: 'date',
      hidden: true
    },
    {
      header: 'Status',
      field: 'status',
      type: 'badge',
      badgeConfig: {
        field: 'status',
        conditions: [
          {
            value: true,
            bgClass: 'bg-green-100',
            textClass: 'text-green-800',
            display: 'Active'
          },
          {
            value: false,
            bgClass: 'bg-red-100',
            textClass: 'text-red-800',
            display: 'Inactive'
          }
        ]
      }
    },
    {
      header: 'Actions',
      field: '',
      type: 'actions'
    }
  ];
  tableData: TableQueryFilter = {
    page: 1,
    limit: 10,
    search: '',
    flag: 'all'
  }

  templates: BudgetTemplate[] = [];
  totalTemplates: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;

  loading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  Math = Math;

  templateForm!: FormGroup;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private templateService: BudgetTemplateService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const actionsColumn = this.tableColumns.find(col => col.type === 'actions');
    if (actionsColumn) {
      actionsColumn.actionConfig = {
        buttons: ['edit', 'delete']
      };
    }
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;

    this.templateService.getAllTemplates(this.tableData).subscribe({
      next: (response) => {
        this.templates = response.budgetTemplates;
        this.totalTemplates = response.totalItems;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.toast.show('error', error.message ?? 'An unknown error occured');
        this.loading = false;
      }
    })
  }

  searchTemplate() {
    this.tableData.page = 1;
    delete this.tableData.status;

    if (this.tableData.flag === 'active') {
      this.tableData.status = true;
    } else if (this.tableData.flag === 'inactive') {
      this.tableData.status = false;
    } else {
      this.tableData.status = undefined;
    }

    this.loadTemplates();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.tableData.page = page;
    this.loadTemplates();
  }

  handleTemplateAction(event: { action: string, item: any}): void {
    const { action, item } = event;

    if (action === 'edit') {
      this.openEditModal(item);
    } else if (action === 'delete') {
      this.deleteTemplate(item);
    }
  }

  openCreateModal() {
    this.templateForm = this.fb.group({
      templateName: ['', [Validators.required, Validators.minLength(3)]],
      status: [true, Validators.required],
      formula: this.fb.array([
        this.createFormulaGroup()
      ], [totalPercentageValidator()])
    });

    this.isEditMode = false;
    this.isModalOpen = true;
  }

  createFormulaGroup(): FormGroup {
    return this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3)]],
      percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  get formulaArray() {
    return this.templateForm.get('formula') as FormArray;
  }

  addFormula() {
    // Only add if total percentage doesn't exceed 100%
    const currentTotal = this.getTotalPercentage();
    if (currentTotal < 100) {
      this.formulaArray.push(this.createFormulaGroup());
    } else {
      this.toast.show('error', 'Total percentage cannot exceed 100%');
    }
  }

  removeFormula(index: number) {
    this.formulaArray.removeAt(index);
  }

  getTotalPercentage(): number {
    if (!this.formulaArray) return 0;

    return this.formulaArray.controls
      .map(group => Number(group.get('percentage')?.value || 0))
      .reduce((sum, current) => sum + current, 0);
  }

  openEditModal(template: BudgetTemplate) {
    const formulaControls = this.fb.array(
      template.formula.map(item =>
        this.fb.group({
          label: [item.label, [Validators.required, Validators.minLength(3)]],
          percentage: [item.percentage, [Validators.required, Validators.min(1), Validators.max(100)]]
        })
      ),
      [totalPercentageValidator()]
    );

    if (formulaControls.length === 0) {
      formulaControls.push(this.createFormulaGroup());
    }

    this.templateForm = this.fb.group({
      _id: [template._id],
      templateName: [template.templateName, [Validators.required, Validators.minLength(3)]],
      status: [template.status, Validators.required],
      formula: formulaControls
    });

    this.isEditMode = true;
    this.isModalOpen = true;
  }

  onModalClose() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
  }

  deleteTemplate(template: BudgetTemplate) {
    if (confirm(`Are you sure you want to delete "${template.templateName}"?`)) {
      this.templateService.deleteTemplate(template._id).subscribe({
        next: () => {
          this.toast.show('success', 'Template deleted successfully');
          this.loadTemplates();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to delete template');
        }
      });
    }
  }

  onSubmit() {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.templateForm.value;

    const totalPercentage = this.getTotalPercentage();
    if (totalPercentage < 100) {
      if (!confirm(`Total percentage is ${totalPercentage}%. Continue anyway?`)) {
        this.isSubmitting = false;
        return;
      }
    }

    if (this.isEditMode) {
      this.templateService.updateTemplate(formData._id, formData).subscribe({
        next: () => {
          this.toast.show('success', 'Template updated successfully');
          this.onModalClose();
          this.loadTemplates();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to update template');
          this.isSubmitting = false;
        }
      })
    } else {
      this.templateService.createTemplate(formData).subscribe({
        next: () => {
          this.toast.show('success', 'Template created successfully');
          this.onModalClose();
          this.loadTemplates();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to create template');
          this.isSubmitting = false;
        }
      })
    }
  }
}
