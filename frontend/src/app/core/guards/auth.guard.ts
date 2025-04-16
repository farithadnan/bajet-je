import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { map, take } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;

      if (isLoggedIn) {
        return true;
      }

      // Redirect to the login page
      return router.createUrlTree(['/auth']);
    })
  );
};
