import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { SafeUser, User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toastr.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { AuthService } from '../../shared/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../shared/components/form-select/form-select.component';
import { FormRadioGroupComponent } from '../../shared/components/form-radio-group/form-radio-group.component';
import { TableColumn, TableQueryFilter } from '../../shared/models/table.model';

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableComponent,
    ModalComponent,
    FormInputComponent,
    FormSelectComponent,
    FormRadioGroupComponent
  ],
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  tableColumns: TableColumn[] = [
    {
      header: 'User',
      field: 'username',
      type: 'avatar'
    },
    {
      header: 'Email',
      field: 'email',
      type: 'text'
    },
    {
      header: 'Role',
      field: 'role',
      type: 'badge',
      badgeConfig: {
        field: 'role',
        conditions: [
          {
            value: 'admin',
            bgClass: 'bg-purple-100',
            textClass: 'text-purple-800',
            display: 'Admin'
          },
          {
            value: 'user',
            bgClass: 'bg-blue-100',
            textClass: 'text-blue-800',
            display: 'User'
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
      header: 'Last Login',
      field: 'lastLogin',
      type: 'date',
      hidden: true
    },
    {
      header: 'Actions',
      field: '',
      type: 'actions'
    }
  ];
  currentUser!: SafeUser;

  users: User[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  loading: boolean = false;
  isModelOpen: boolean = false;
  Math = Math;

  tableData: TableQueryFilter = {
    page: 1,
    limit: 10,
    search: '',
    role: 'all',
  }

  // Edit/create properties
  userForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  currentEditingUser: User | null = null;

  // Reset password properties
  resetPasswordForm!: FormGroup;
  showPasswordResetModal = false;
  userToResetPassword: User | null = null;

  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toast: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(({ user }: { user: SafeUser }) => {
      this.currentUser = user;

      // Find the actions column and configure it
      const actionsColumn = this.tableColumns.find(col => col.type === 'actions');
      if (actionsColumn) {
        actionsColumn.actionConfig = {
          buttons: ['edit', 'delete', 'reset'], // Only show these buttons
          disableConditions: {
            // Disable delete button for own user
            delete: (item: any, contextData: any) => {
              return item._id === contextData?._id || // Can't delete yourself
                     item.role === 'admin';
            },
            edit: (item: any, contextData: any) => {
              return item._id === contextData?._id ||
                    (item.role === 'admin' && contextData?.role !== 'admin');
            },
            reset: (item: any, contextData: any) => {
              return item._id === contextData?._id ||
                     item.role === 'admin';
            }
          },
          disabledTooltips: {
            delete: "You cannot delete this account",
            edit: "You don't have permission to edit admin users",
            reset: "You can't reset this password"
          }
        };
      }

      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers(this.tableData).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.totalItems;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.toast.show('error', error.message ?? 'An unknown error occurred');
        this.loading = false;
      }
    })
  }

  // Search method
  searchUsers() {
    this.tableData.page = 1;

    delete this.tableData.status;

    if (this.tableData.role === 'active') {
      this.tableData.status = true;
      this.tableData.role = 'all';
    } else if (this.tableData.role === 'inactive') {
      this.tableData.status = false;
      this.tableData.role = 'all';
    } else {
      this.tableData.status == undefined;
    }

    this.loadUsers();
  }

  // Add handler for row actions
  handleUserAction(event: { action: string, item: any }): void {
    const { action, item } = event;

    if (action === 'edit') {
      this.openEditModal(item);
    } else if (action === 'reset') {
      this.openResetPassword(item);
    } else if (action === 'delete') {
      this.deleteUser(item);
    }
  }

  openCreateModal() {
    // First create the form
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user', Validators.required],
      status: [true, Validators.required]
    });

    // Set component state
    this.isEditMode = false;
    this.currentEditingUser = null;

    // Wait for Angular to process the form creation before opening modal
    setTimeout(() => {
      this.isModelOpen = true;
    }, 0);
  }

  openEditModal(user: User) {
    // Create a form pre-populated with the user's data
    this.userForm = this.fb.group({
      username: [user.username, [Validators.required, Validators.minLength(5)]],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role, Validators.required],
      status: [user.status, Validators.required]
    });

    // Set the mode to edit and store the current user
    this.isEditMode = true;
    this.currentEditingUser = user;

    // Open the modal
    this.isModelOpen = true;
  }

  openResetPassword(user: User) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.userToResetPassword = user;
    this.showPasswordResetModal = true;
  }

  onModalClose() {
    this.isModelOpen = false;
    this.userForm = null as any;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.currentEditingUser = null;
  }

  closeResetPasswordModal() {
    this.showPasswordResetModal = false;
    this.resetPasswordForm = null as any;
    this.userToResetPassword = null;
  }

  onResetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { newPassword } = this.resetPasswordForm.value;
    const userId = this.userToResetPassword!._id;

    this.userService.resetUserPassword(userId, newPassword).subscribe({
      next: (response) => {
        this.toast.show('success', 'Password reset successfully');
        this.showPasswordResetModal = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.toast.show('error', error.message || 'Failed to reset password');
      }
    })
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const userData = this.userForm.value;

    if (this.isEditMode) {
      // Update existing user
      this.userService.updateUser(this.currentEditingUser!._id, userData).subscribe({
        next: (response) => {
          this.toast.show('success', 'User updated successfully');
          this.isModelOpen = false;
          this.isSubmitting = false;
          this.loadUsers();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to update user');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new user
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          this.toast.show('success', 'User created successfully');
          this.isModelOpen = false;
          this.isSubmitting = false;
          this.loadUsers();
        },
        error: (error) => {
          this.toast.show('error', error.message || 'Failed to create user');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Are you sure you want to delete user "${user.username}?"`)) {
      return;
    }

    this.loading = true;
    this.userService.deleteUser(user._id).subscribe({
      next: (response) => {
        this.toast.show('success', response.message || 'User deleted successfully');
        this.loadUsers();
      },
      error: (error) => {
        this.loading = false;
        this.toast.show('error', error.message || 'Failed to delete user');
      }
    });
  }

  // Page change handler
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.tableData.page = page;
    this.loadUsers();
  }
}
