import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableQueryFilter, UserService } from '../../shared/services/user.service';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toastr.service';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

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
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

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
  editUser(user: any): void {
    console.log('Edit user:', user);
    // Implement edit functionality
  }

  deleteUser(user: any): void {
    console.log('Delete user:', user);
    // Implement delete functionality
  }

  // Page change handler
  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.tableData.page = page;
    this.loadUsers();
  }
}
