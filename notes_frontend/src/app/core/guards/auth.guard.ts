import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// PUBLIC_INTERFACE
export const authGuard: CanActivateFn = () => {
  /** This is a public function.
   * Guard that ensures the user is authenticated, else redirects to /login.
   */
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
