import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { MonthlyBudget} from '../../core/models/monthly-budget.model';
import { TableColumn, TableQueryFilter } from '../../shared/models/table.model';
import { MonthlyBudgetService } from '../../shared/services/monthly-budget.service';
import { ToastService } from '../../shared/services/toastr.service';
import { BudgetTemplateService } from '../../shared/services/budget-template.service';
import { BudgetTemplate } from '../../core/models/budget-template.model';

@Component({
  selector: 'app-monthly-budget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './monthly-budget.component.html',
  styleUrl: './monthly-budget.component.css'
})
export class MonthlyBudgetComponent implements OnInit {
  tableColumns: TableColumn[] = [
    {
      header: 'Month/Year',
      field: 'month', // Change to use a field that exists in your data
      type: 'text',
      formatter: (item: any) => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[item.month - 1]} ${item.year}`;
      }
    },
    {
      header: 'Template',
      field: 'budgetTemplateId',
      type: 'text',
      formatter: (item: any) => {

        // Handle null or undefined budgetTemplateId
        if (!item.budgetTemplateId) {
          return 'Unknown Template';
        }

        // Handle object with templateName property
        if (typeof item.budgetTemplateId === 'object' && 'templateName' in item.budgetTemplateId) {
          return item.budgetTemplateId.templateName;
        }

        // Handle string ID case or any other case
        return 'Unknown Template';
      }
    },
    {
      header: 'Income',
      field: 'totalIncome',
      type: 'text',
      formatter: (item: any) => {
        return `$${item.totalIncome.toFixed(2)}`;
      }
    },
    {
      header: 'Expenses',
      field: 'totalExpenses',
      type: 'text',
      formatter: (item: any) => {
        return `$${item.totalExpenses.toFixed(2)}`;
      }
    },
    {
      header: 'Remaining',
      field: 'remainingAmount',
      type: 'badge',
      badgeConfig: {
        field: 'remainingAmount',
        valueGetter: (item) => {
          return (item.remainingAmount || 0) >= 0 ? 'positive' : 'negative';
        },
        conditions: [
          {
            value: 'positive',
            bgClass: 'bg-green-100',
            textClass: 'text-green-800',
            display: (item) => {
              return `$${(item.remainingAmount || 0).toFixed(2)}`;
            }
          },
          {
            value: 'negative',
            bgClass: 'bg-red-100',
            textClass: 'text-red-800',
            display: (item) => {
              return `-$${Math.abs(item.remainingAmount || 0).toFixed(2)}`;
            }
          }
        ]
      }
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
    flag: 'all',
    month: 0,
    year: new Date().getFullYear()
  };

  monthlyBudgets: MonthlyBudget[] = [];
  totalBudgets: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;

  loading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  isViewMode: boolean = false;
  Math = Math;

  budgetForm!: FormGroup;

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  monthOptions = [
    { label: 'All Months', value: 0 },
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  availableTemplates: BudgetTemplate[] = [];

  constructor(
    private budgetService: MonthlyBudgetService,
    private templateService: BudgetTemplateService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const actionsColumn = this.tableColumns.find(col => col.type === 'actions');
    if (actionsColumn) {
      actionsColumn.actionConfig = {
        buttons: ['edit', 'view', 'delete']
      };
    }
    this.loadBudgets();
    this.loadTemplates();
  }

  loadBudgets(): void {
    this.loading = true;

    this.budgetService.getAllMonthlyBudgets(this.tableData).subscribe({
      next: (response) => {
        this.monthlyBudgets = response.monthlyBudgets;
        this.totalBudgets = response.totalBudgets;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.toast.show('error', error.message ?? 'An unknown error occurred');
        this.loading = false;
      }
    });
  }

  loadTemplates(): void {
    this.templateService.getAllTemplates({ page: 1, limit: 100, status: true }).subscribe({
      next: (response) => {
        this.availableTemplates = response.budgetTemplates;
      },
      error: (error) => {
        this.toast.show('error', 'Failed to load budget templates');
      }
    });
  }

  searchBudget() {
    this.tableData.page = 1;
    delete this.tableData.status;

    if (this.tableData.flag === 'active') {
      this.tableData.status = true;
    } else if (this.tableData.flag === 'inactive') {
      this.tableData.status = false;
    } else {
      this.tableData.status = undefined;
    }

    this.loadBudgets();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.tableData.page = page;
    this.loadBudgets();
  }

  handleBudgetAction(event: { action: string, item: any}): void {
    const { action, item } = event;

    if (action === 'edit') {
      this.openEditModal(item);
    } else if (action === 'delete') {
      this.deleteBudget(item);
    } else if (action === 'view') {
      this.openViewModal(item);
    }
  }

  openCreateModal() {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const currentYear = now.getFullYear();

    this.budgetForm = this.fb.group({
      budgetTemplateId: ['', Validators.required],
      month: [currentMonth, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      totalIncome: [0, [Validators.required, Validators.min(0)]],
      formula: this.fb.array([]),
      expenses: this.fb.array([])
    });

    this.isEditMode = false;
    this.isViewMode = false;
    this.isModalOpen = true;
  }
  openEditModal(budget: MonthlyBudget) {
    const formulaControls = budget.formula.map(item =>
      this.fb.group({
        label: [item.label, Validators.required],
        percentage: [item.percentage, [Validators.required, Validators.min(1), Validators.max(100)]],
        allocatedAmount: [item.allocatedAmount]
      })
    );

    const expensesControls = budget.expenses.map(expense =>
      this.fb.group({
        name: [expense.name, Validators.required],
        amount: [expense.amount, [Validators.required, Validators.min(0)]],
        label: [expense.label, Validators.required],
        expensedDate: [expense.expensedDate]
      })
    );

    // Extract the template ID - handle both object and string cases
    const templateId = typeof budget.budgetTemplateId === 'object' && budget.budgetTemplateId !== null
      ? budget.budgetTemplateId._id  // Extract ID from object
      : budget.budgetTemplateId;     // Use directly if already a string

    this.budgetForm = this.fb.group({
      _id: [budget._id],
      budgetTemplateId: [templateId, Validators.required],
      month: [budget.month, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [budget.year, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      totalIncome: [budget.totalIncome, [Validators.required, Validators.min(0)]],
      formula: this.fb.array(formulaControls),
      expenses: this.fb.array(expensesControls),
      status: [budget.status, Validators.required]
    });

    this.isEditMode = true;
    this.isViewMode = false;
    this.isModalOpen = true;
  }

  openViewModal(budget: MonthlyBudget) {
    const formulaControls = budget.formula.map(item =>
      this.fb.group({
        label: [{ value: item.label, disabled: true }, Validators.required],
        percentage: [{ value: item.percentage, disabled: true }, [Validators.required, Validators.min(1), Validators.max(100)]],
        allocatedAmount: [{ value: item.allocatedAmount, disabled: true }]
      })
    );

    const expensesControls = budget.expenses.map(expense =>
      this.fb.group({
        name: [{ value: expense.name, disabled: true }, Validators.required],
        amount: [{ value: expense.amount, disabled: true }, [Validators.required, Validators.min(0)]],
        label: [{ value: expense.label, disabled: true }, Validators.required],
        expensedDate: [{ value: expense.expensedDate, disabled: true }]
      })
    );

    // Extract the template ID - handle both object and string cases
    const templateId = typeof budget.budgetTemplateId === 'object' && budget.budgetTemplateId !== null
      ? budget.budgetTemplateId._id  // Extract ID from object
      : budget.budgetTemplateId;     // Use directly if already a string

    this.budgetForm = this.fb.group({
      _id: [{ value: budget._id, disabled: true }],
      budgetTemplateId: [{ value: templateId, disabled: true }, Validators.required],
      month: [{ value: budget.month, disabled: true }, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [{ value: budget.year, disabled: true }, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      totalIncome: [{ value: budget.totalIncome, disabled: true }, [Validators.required, Validators.min(0)]],
      formula: this.fb.array(formulaControls),
      expenses: this.fb.array(expensesControls),
      status: [{ value: budget.status, disabled: true }, Validators.required]
    });

    this.isViewMode = true;
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  onModalClose() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.isSubmitting = false;
  }

  onTemplateChange(event: any) {
    const templateId = event.target.value;
    const selectedTemplate = this.availableTemplates.find(t => t._id === templateId);

    if (selectedTemplate && selectedTemplate.formula) {
      // Clear existing formula items
      while (this.formulaArray.length) {
        this.formulaArray.removeAt(0);
      }

      // Add formula items from template
      selectedTemplate.formula.forEach(item => {
        this.formulaArray.push(this.fb.group({
          label: [item.label, Validators.required],
          percentage: [item.percentage, [Validators.required, Validators.min(1), Validators.max(100)]],
          allocatedAmount: [0] // Will be calculated later
        }));
      });

      // Update allocatedAmount values based on current income
      this.calculateAllocations();
    }
  }

  onIncomeChange() {
    this.calculateAllocations();
  }

  calculateAllocations() {
    const income = this.budgetForm.get('totalIncome')?.value || 0;

    this.formulaArray.controls.forEach(control => {
      const percentage = control.get('percentage')?.value || 0;
      const allocatedAmount = (percentage / 100) * income;
      control.get('allocatedAmount')?.setValue(allocatedAmount);
    });
  }

  createFormulaGroup(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required],
      percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      allocatedAmount: [0]
    });
  }

  createExpenseGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      label: ['', Validators.required],
      expensedDate: [new Date()]
    });
  }

  get formulaArray() {
    return this.budgetForm.get('formula') as FormArray;
  }

  get expensesArray() {
    return this.budgetForm.get('expenses') as FormArray;
  }

  addExpense() {
    this.expensesArray.push(this.createExpenseGroup());
  }

  removeExpense(index: number) {
    this.expensesArray.removeAt(index);
  }

  getAvailableLabels(): string[] {
    return this.formulaArray.controls.map(control => control.get('label')?.value).filter(label => !!label);
  }

  getTotalExpenses(): number {
    if (!this.expensesArray || !this.expensesArray.controls.length) return 0;

    return this.expensesArray.controls
      .map(group => Number(group.get('amount')?.value || 0))
      .reduce((sum, current) => sum + current, 0);
  }

  getRemainingAmount(): number {
    const totalIncome = this.budgetForm.get('totalIncome')?.value || 0;
    const totalExpenses = this.getTotalExpenses();
    return totalIncome - totalExpenses;
  }

  deleteBudget(budget: MonthlyBudget) {
    if (confirm(`Are you sure you want to delete this budget for ${this.getMonthName(budget.month)} ${budget.year}?`)) {
      this.budgetService.deleteMonthlyBudget(budget._id).subscribe({
        next: () => {
          this.toast.show('success', 'Budget deleted successfully');
          this.loadBudgets();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to delete budget');
        }
      });
    }
  }

  getMonthName(monthNumber: number): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNumber - 1];
  }

  onSubmit() {
    if (this.budgetForm.invalid || this.isViewMode) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = { ...this.budgetForm.value };

    // Format dates to match expected format (YYYY-MM-DD)
    if (formData.expenses && formData.expenses.length > 0) {
      formData.expenses = formData.expenses.map((expense: any) => {
        if (expense.expensedDate) {
          // Convert ISO date string to YYYY-MM-DD format
          const date = new Date(expense.expensedDate);
          expense.expensedDate = date.toISOString().split('T')[0];
        }
        return expense;
      });
    }

    if (this.isEditMode) {
      const id = formData._id;
      delete formData._id;

      this.budgetService.updateMonthlyBudget(id, formData).subscribe({
        next: () => {
          this.toast.show('success', 'Budget updated successfully');
          this.onModalClose();
          this.loadBudgets();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to update budget');
          this.isSubmitting = false;
        }
      });
    } else {
      this.budgetService.createMonthlyBudget(formData).subscribe({
        next: () => {
          this.toast.show('success', 'Budget created successfully');
          this.onModalClose();
          this.loadBudgets();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to create budget');
          this.isSubmitting = false;
        }
      });
    }
  }
}
