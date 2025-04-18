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
  user: SafeUser
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
      .set('limit', tableData.limit?.toString() || '0');

    if (tableData.search) {
      params = params.set('search', tableData.search);
    }

    if (tableData.role) {
      params = params.set('role', tableData.role);
    }

    if (tableData.status !== undefined) {
      params = params.set('status', tableData.status.toString());
    }


    return this.http.get<GetAllUsersResponse>(`${this.apiUrl}/users`, {
      params,
      withCredentials: true
    })
    .pipe(
      catchError(this.util.handleError)
    )
  }
}
