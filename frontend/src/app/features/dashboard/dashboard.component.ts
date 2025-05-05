import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './dashboard.service';
import Chart from 'chart.js/auto';
import { ToastService } from '../../shared/services/toastr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('expenseChart') expenseChartCanvas!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartCanvas!: ElementRef;

  loading = true;
  dashboardData: any = {
    currentBudget: null,
    summary: null,
    recentExpenses: [],
    categoryBreakdown: [],
    monthlyTrends: []
  };

  currentYear = new Date().getFullYear();

  private expenseChart!: Chart;
  private monthlyChart!: Chart;

  constructor(
    private dashboardService: DashboardService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = {
          currentBudget: data.currentMonthBudget,
          summary: data.budgetSummary,
          recentExpenses: data.recentExpenses,
          categoryBreakdown: data.categoryBreakdown,
          monthlyTrends: data.monthlyTrends
        };

        this.loading = false;

        // Initialize charts now that we have data
        setTimeout(() => {
          this.initializeCharts();
        }, 100);
      },
      error: (error) => {
        this.toast.show('error', 'Failed to load dashboard data');
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    if (this.expenseChartCanvas) {
      this.createExpenseChart();
    }

    if (this.monthlyChartCanvas) {
      this.createMonthlyChart();
    }
  }

  createExpenseChart(): void {
    const ctx = this.expenseChartCanvas.nativeElement.getContext('2d');

    // Extract data for the chart
    const labels = this.dashboardData.categoryBreakdown.map((item: any) => item.category);
    const allocated = this.dashboardData.categoryBreakdown.map((item: any) => item.allocated);
    const spent = this.dashboardData.categoryBreakdown.map((item: any) => item.spent);

    this.expenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Allocated',
            data: allocated,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Spent',
            data: spent,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createMonthlyChart(): void {
    if (!this.monthlyChartCanvas) return;

    const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
    const monthlyData = this.dashboardData.monthlyTrends || [];

    // Get month labels
    const labels = monthlyData.map((item: any) => this.getMonthName(item.month));

    // Get income and expense data
    const incomeData = monthlyData.map((item: any) => item.totalIncome);
    const expenseData = monthlyData.map((item: any) => item.totalExpenses);
    const savingsData = monthlyData.map((item: any) => item.savings);

    // Create the chart
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Savings',
            data: savingsData,
            type: 'line',
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                // Tooltip code remains the same
              }
            }
          }
        }
      }
    });
  }

  getMonthName(monthNumber: number): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthNumber - 1];
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateProgressBarWidth(percentageUsed: number): string {
    return `${Math.min(100, percentageUsed)}%`;
  }

  getProgressBarColor(percentageUsed: number): string {
    if (percentageUsed >= 100) return 'bg-red-500';
    if (percentageUsed >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}
