import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UtilsService {

  constructor() {}

  public handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
      // Optional: navigate to dashboard or show permission denied message
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
