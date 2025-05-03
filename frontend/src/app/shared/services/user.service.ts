import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { SafeUser, User } from "../../core/models/user.model";
import { catchError, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { UtilsService } from "./utils.services";


export interface TableQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAllUsersResponse {
  users: User[],
  totalUsers: number,
  totalPages: number,
  currentPage: number,
}

export interface UserResponse {
  message: string,
  user?: SafeUser
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: string;
  status?: boolean;
}


@Injectable({
  providedIn: "root"
})
export class UserService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private util: UtilsService){}


  getAllUsers(tableData: TableQueryFilter): Observable<GetAllUsersResponse> {
    let params = new HttpParams()
      .set('page', tableData.page?.toString() || '1')
      .set('limit', tableData.limit?.toString() || '10');

    if (tableData.search && tableData.search.trim() !== '') {
      params = params.set('search', tableData.search.trim());
    }

    if (tableData.role && tableData.role !== 'all') {
      params = params.set('role', tableData.role);
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

    return this.http.get<GetAllUsersResponse>(`${this.apiUrl}/users`, {
      params,
      withCredentials: true
    })
    .pipe(
      catchError(this.util.handleError)
    )
  }

  createUser(userData: CreateUserData): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/users/create`, userData, { withCredentials: true})
    .pipe(
      catchError(this.util.handleError)
    )
  }

  updateUser(id: string, userData: UpdateUserData): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/users/${id}`, userData, { withCredentials: true})
      .pipe(
        catchError(this.util.handleError)
      )
  }

  deleteUser(id: string): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.apiUrl}/users/${id}`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.util.handleError)
      );
  }
}
