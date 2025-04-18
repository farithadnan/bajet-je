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

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
