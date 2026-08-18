import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Espera a que se resuelva la restauración de sesión (token en localStorage) antes de
  // decidir: si no, una recarga directa a esta ruta expulsaría a un usuario ya logueado.
  await auth.waitUntilReady();
  if (auth.isLoggedIn) return true;
  return router.createUrlTree(['/'], { queryParams: { login: '1' } });
};
