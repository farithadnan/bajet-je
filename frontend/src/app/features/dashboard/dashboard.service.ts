import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GetAllMonthlyBudgetResponse } from '../../shared/services/monthly-budget.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    // Use forkJoin to make multiple API calls in parallel
    return forkJoin({
      currentMonthBudget: this.getCurrentMonthBudget(),
      budgetSummary: this.getBudgetSummary(),
      recentExpenses: this.getRecentExpenses(),
      categoryBreakdown: this.getCategoryBreakdown(),
      monthlyTrends: this.getMonthlyTrends()
    });
  }

  private getCurrentMonthBudget(): Observable<any> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    return this.http.get<GetAllMonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets?month=${currentMonth}&year=${currentYear}&limit=1`, { withCredentials: true })
      .pipe(
        map(response => response.monthlyBudgets[0] || null)
      );
  }

  private getBudgetSummary(): Observable<any> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return this.http.get<GetAllMonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets?year=${currentYear}&limit=12`, { withCredentials: true })
      .pipe(
        map(response => {
          const monthlyBudgets = response.monthlyBudgets || [];

          // Calculate totals and averages
          return {
            totalIncome: this.calculateTotal(monthlyBudgets, 'totalIncome'),
            totalExpenses: this.calculateTotal(monthlyBudgets, 'totalExpenses'),
            averageIncome: this.calculateAverage(monthlyBudgets, 'totalIncome'),
            averageExpenses: this.calculateAverage(monthlyBudgets, 'totalExpenses'),
            savingsRate: this.calculateSavingsRate(monthlyBudgets),
            months: monthlyBudgets.length
          };
        })
      );
  }

  private getRecentExpenses(): Observable<any[]> {
    return this.http.get<GetAllMonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets?limit=3`, { withCredentials: true })
      .pipe(
        map(response => {
          const monthlyBudgets = response.monthlyBudgets || [];
          const allExpenses: any[] = [];

          // Extract expenses from budgets
          monthlyBudgets.forEach(budget => {
            if (budget.expenses && budget.expenses.length) {
              budget.expenses.forEach(expense => {
                allExpenses.push({
                  ...expense,
                  month: budget.month,
                  year: budget.year,
                  date: new Date(expense.expensedDate)
                });
              });
            }
          });

          // Sort by date (newest first) and take top 5
          return allExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
        })
      );
  }

  private getCategoryBreakdown(): Observable<any> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    return this.http.get<GetAllMonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets?month=${currentMonth}&year=${currentYear}&limit=1`, { withCredentials: true })
      .pipe(
        map(response => {
          const budget = response.monthlyBudgets[0] || { formula: [], expenses: [] };

          // Create category breakdown with allocated vs actual spending
          return budget.formula.map(category => {
            const categoryExpenses = this.calculateCategoryExpenses(budget.expenses, category.label);
            const percentageUsed = category.allocatedAmount > 0
              ? (categoryExpenses / category.allocatedAmount) * 100
              : 0;

            return {
              category: category.label,
              allocated: category.allocatedAmount,
              spent: categoryExpenses,
              remaining: category.allocatedAmount - categoryExpenses,
              percentageUsed: Math.min(percentageUsed, 100), // Cap at 100%
              isOverBudget: categoryExpenses > category.allocatedAmount
            };
          });
        })
      );
  }

  private getMonthlyTrends(): Observable<any[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Get monthly data for the last 6 months
    return this.http.get<any>(`${this.apiUrl}/monthly-budgets?year=${currentYear}&limit=12`, {
      withCredentials: true
    }).pipe(
      map(response => {
        const monthlyBudgets = response.monthlyBudgets || [];

        // Create an array of months from 1-12
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        // Map each month to its corresponding budget data
        return months.map(month => {
          const budget = monthlyBudgets.find((b: any) => b.month === month);
          return {
            month,
            totalIncome: budget ? budget.totalIncome : 0,
            totalExpenses: budget ? budget.totalExpenses : 0,
            savings: budget ? budget.totalIncome - budget.totalExpenses : 0
          };
        });
      })
    );
  }

  // Helper methods
  private calculateTotal(budgets: any[], property: string): number {
    return budgets.reduce((sum, budget) => sum + (budget[property] || 0), 0);
  }

  private calculateAverage(budgets: any[], property: string): number {
    if (budgets.length === 0) return 0;
    return this.calculateTotal(budgets, property) / budgets.length;
  }

  private calculateSavingsRate(budgets: any[]): number {
    const totalIncome = this.calculateTotal(budgets, 'totalIncome');
    const totalExpenses = this.calculateTotal(budgets, 'totalExpenses');

    if (totalIncome === 0) return 0;
    return ((totalIncome - totalExpenses) / totalIncome) * 100;
  }

  private calculateCategoryExpenses(expenses: any[], category: string): number {
    if (!expenses) return 0;
    return expenses
      .filter(expense => expense.label === category)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }
}
