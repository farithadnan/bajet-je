import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableQueryFilter, UserService } from '../../shared/services/user.service';
import { SafeUser, User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toastr.service';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-user-management',
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent
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
  error: string | null = null;
  Math = Math;

  tableData: TableQueryFilter = {
    page: 1,
    limit: 10,
    search: '',
    role: 'all',
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(({ user }: { user: SafeUser }) => {
      this.currentUser = user;

      // Find the actions column and configure it
      const actionsColumn = this.tableColumns.find(col => col.type === 'actions');
      if (actionsColumn) {
        actionsColumn.actionConfig = {
          buttons: ['edit', 'delete'], // Only show these buttons
          disableConditions: {
            // Disable delete button for own user
            delete: (item: any, contextData: any) => {
              return item._id === contextData?._id; // Can't delete yourself
            },
            // Example: disable edit for admin users if current user is not admin
            // edit: (item: any, contextData: any) => {
            //   return item.role === 'admin' && contextData?.role !== 'admin';
            // }
          },
          disabledTooltips: {
            delete: "You cannot delete your own account",
            edit: "You don't have permission to edit admin users"
          }
        };
      }

      this.loadUsers();
    });  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers(this.tableData).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.totalUsers;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load users';
        this.toast.show('error', this.error ?? 'An unknown error occurred');
        this.loading = false;
      }
    })
  }

  // Search method
  searchUsers() {
    this.tableData.page = 1;

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
      // Handle edit user
      this.editUser(item);
    } else if (action === 'delete') {
      // Handle delete user
      this.deleteUser(item);
    }
  }

  // Implement these methods according to your requirements
  editUser(user: User): void {
    console.log('Edit user:', user);
    // Implement edit functionality
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
