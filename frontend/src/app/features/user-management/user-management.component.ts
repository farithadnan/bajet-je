import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableQueryFilter, UserService } from '../../shared/services/user.service';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toastr.service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  loading: boolean = false;
  error: string | null = null;

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
    this.tableData.page = 1; // Reset to first page when searching
    this.loadUsers();
  }

  // Reset filters
  resetFilters() {
    this.tableData = {
      page: 1,
      limit: 10,
      search: '',
      role: 'all'
    };
    this.loadUsers();
  }

  // Page change handler
  onPageChange(page: number) {
    this.tableData.page = page;
    this.loadUsers();
  }

}
