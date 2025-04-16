import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { map, take } from "rxjs";

export const LoginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;

      if (isLoggedIn) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    })
  );
};
