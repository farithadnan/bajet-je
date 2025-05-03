import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { map, take } from "rxjs";

export const AdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth']);
      }

      if (user.role === 'admin') {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    })
  );
};
