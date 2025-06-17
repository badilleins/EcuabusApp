import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from './login/services/auth.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.fetchUserRole().pipe(
      map(role => {
        const targetUrl = state.url;

        if (!role) {
          this.router.navigate(['/login']);
          return false;
        }

        // Normaliza rol a minúsculas para comparar
        role = role.toLowerCase();

        const conductorRoles = ['conductor', 'cobrador'];
        const tabsRoles = ['cliente', 'taquillero'];

        if (conductorRoles.includes(role) && targetUrl.startsWith('/conductor')) {
          return true;
        }

        if (tabsRoles.includes(role) && targetUrl.startsWith('/tabs')) {
          return true;
        }

        // Redirige si intenta ir a una ruta que no le corresponde
        if (conductorRoles.includes(role)) {
          this.router.navigate(['/conductor']);
        } else if (tabsRoles.includes(role)) {
          this.router.navigate(['/tabs']);
        } else {
          this.router.navigate(['/login']);
        }

        return false;
      }),
      catchError(error => {
        console.error('Error en AuthGuard:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
