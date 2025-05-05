import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UtilsService } from "./utils.services";
import { PaginatedResponse, TableQueryFilter } from "../models/table.model";
import { MonthlyBudget, MonthlyBudgetExpenses, MonthlyBudgetFormulatItem } from "../../core/models/monthly-budget.model";
import { catchError, Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface GetAllMonthlyBudgetResponse extends PaginatedResponse<MonthlyBudget> {
  monthlyBudgets: MonthlyBudget[],
  totalBudgets: number
}

export interface MonthlyBudgetResponse {
  message: string,
  monthlyBudget: MonthlyBudget
}

export interface CreateMonthlyBudgetData {
  budgetTemplateId: string,
  month: number,
  year: number,
  totalIncome: number,
  formula: MonthlyBudgetFormulatItem[],
  expenses: MonthlyBudgetExpenses[]
}

export interface UpdateMonthlyBudgetData {
  budgetTemplateId: string,
  month: number,
  year: number,
  totalIncome: number,
  formula: MonthlyBudgetFormulatItem[],
  expenses: MonthlyBudgetExpenses[],
  status: boolean
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyBudgetService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private util: UtilsService) {}

  getAllMonthlyBudgets(tableData: TableQueryFilter): Observable<GetAllMonthlyBudgetResponse> {
    let params = new HttpParams()
      .set('page', tableData.page?.toString() || '1')
      .set('limit', tableData.limit?.toString() || '10');

    if (tableData.search && tableData.search.trim() !== '') {
      params = params.set('search', tableData.search.trim());
    }

    if (tableData.status !== undefined) {
      params = params.set('status', tableData.status.toString());
    }

    if (tableData.month && tableData.month !== 0) {
      params = params.set('month', tableData.month);
    }

    if (tableData.year && tableData.year !== 0) {
      params = params.set('year', tableData.year);
    }

    if (tableData.sortBy) {
      params = params.set('sortBy', tableData.sortBy);
      if (tableData.sortOrder) {
        params = params.set('sortOrder', tableData.sortOrder);
      }
    }

    return this.http.get<GetAllMonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets`, {
      params,
      withCredentials: true
    })
    .pipe(
      catchError(this.util.handleError)
    )
  }

  createMonthlyBudget(budgetData: CreateMonthlyBudgetData): Observable<MonthlyBudgetResponse> {
    return this.http.post<MonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets`, budgetData, {withCredentials: true})
      .pipe(
        catchError(this.util.handleError)
      )
  }

  updateMonthlyBudget(id: string, budgetData: UpdateMonthlyBudgetData): Observable<MonthlyBudgetResponse> {
    return this.http.put<MonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets/${id}`, budgetData, {withCredentials: true})
      .pipe(
        catchError(this.util.handleError)
      )
  }

  deleteMonthlyBudget(id: string): Observable<MonthlyBudgetResponse> {
    return this.http.delete<MonthlyBudgetResponse>(`${this.apiUrl}/monthly-budgets/${id}`, { withCredentials: true })
      .pipe(
        catchError(this.util.handleError)
      )
  }
}
