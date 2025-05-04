import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { BudgetTemplate } from '../../core/models/budget-template.model';
import { ToastService } from '../../shared/services/toastr.service';
import { TableColumn, TableQueryFilter } from '../../shared/models/table.model';
import { BudgetTemplateService } from '../../shared/services/budget-template.service';

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
  tableColumns: TableColumn[] = [
    {
      header: 'Template Name',
      field: 'templateName',
      type: 'avatar'
    },
    {
      header: 'User',
      field: 'userId',
      type: 'text'
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
  isModelOpen: boolean = false;
  Math = Math;

  constructor(
    private templateService: BudgetTemplateService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;

    this.templateService.getAllTemplates(this.tableData).subscribe({
      next: (response) => {
        this.templates = response.templates;
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
      this.tableData.status == undefined;
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

  openCreateModal() {}

  openEditModal(template: BudgetTemplate) {}

  onModalClose() {}

  resetFormStage() {}

  deleteTemplate(template: BudgetTemplate) {}

  onSubmit() {}
}
