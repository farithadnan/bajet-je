import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UtilsService } from "./utils.services";
import { PaginatedResponse, TableQueryFilter } from "../models/table.model";
import { BudgetTemplate, FormulaItem } from "../../core/models/budget-template.model";
import { catchError, Observable } from "rxjs";


export interface GetAllTemplatesResponse extends PaginatedResponse<BudgetTemplate> {
  budgetTemplates: BudgetTemplate[];
  totalTemplates: number;
}

export interface TemplateResponse {
  message: string,
  budgetTemplate?: BudgetTemplate
}

export interface CreateTemplateData {
  templateName: string;
  formula: FormulaItem[]
}

export interface UpdateTemplateData {
  templateName: string;
  status: boolean;
  formula: FormulaItem[]
}

@Injectable({
  providedIn: "root"
})
export class BudgetTemplateService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private util: UtilsService) {}

  getAllTemplates(tableData: TableQueryFilter): Observable<GetAllTemplatesResponse> {
    let params = new HttpParams()
      .set('page', tableData.page?.toString() || '1')
      .set('limit', tableData.limit?.toString() || '10');

    if (tableData.search && tableData.search.trim() !== '') {
      params = params.set('search', tableData.search.trim());
    }

    if (tableData.status !== undefined) {
      params = params.set('status', tableData.status.toString());
    }

    if (tableData.sortBy) {
      params = params.set('sortBy', tableData.sortBy);
      if (tableData.sortOrder) {
        params = params.set('sortOrder', tableData.sortOrder);
      }
    }

    return this.http.get<GetAllTemplatesResponse>(`${this.apiUrl}/budget-templates`, {
      params,
      withCredentials: true
    })
    .pipe(
      catchError(this.util.handleError)
    )
  }

  createTemplate(templateData: CreateTemplateData): Observable<TemplateResponse> {
    return this.http.post<TemplateResponse>(`${this.apiUrl}/budget-templates`, templateData, { withCredentials: true })
      .pipe(
        catchError(this.util.handleError)
      )
  }

  updateTemplate(id: string, templateData: UpdateTemplateData): Observable<TemplateResponse> {
    return this.http.put<TemplateResponse>(`${this.apiUrl}/budget-templates/${id}`, templateData, { withCredentials: true })
      .pipe(
        catchError(this.util.handleError)
      )
  }

  deleteTemplate(id: string): Observable<TemplateResponse> {
    return this.http.delete<TemplateResponse>(`${this.apiUrl}/budget-templates/${id}`, { withCredentials: true })
      .pipe(
        catchError(this.util.handleError)
      )
  }
}
