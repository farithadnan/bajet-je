import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableQueryFilter, UserService } from '../../shared/services/user.service';
import { User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toastr.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
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
    if (page < 1 || page > this.totalPages) return;
    this.tableData.page = page;
    this.loadUsers();
  }

  pageNumbers(): number[] {
    if (!this.totalPages) return [1];

    const current  = this.currentPage;
    const last = this.totalPages;
    const count = 1;
    const left = current - count;
    const right = current + count +1;
    const range = [];
    const rangeWithDots = [];
    let list;

    for (let i = 1; i <= last; i++) {
      if (i == 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }


    for (const i of range) {
      if (list) {
        if (i - list === 2) {
          rangeWithDots.push(list + 1);
        } else if (i - list !== 1) {
          rangeWithDots.push(-1);
        }
      }
      rangeWithDots.push(i);
      list = i;
    }

    return rangeWithDots;

  }

}
