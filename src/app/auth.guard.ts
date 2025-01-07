import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from './login/services/auth.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({ // Agrega el decorador Injectable
  providedIn: 'root', // Esto asegura que el guard esté disponible en toda la aplicación
})

export class AuthGuard implements CanActivate {
  constructor(private AuthService: AuthService, private router: Router) {}


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Verificar si es cobrador
    return this.AuthService.checkIfUserIsCobrador().pipe(
      map((isCobrador) => {
        const targetUrl = state.url; // Ruta a la que intenta acceder

        // Lógica de acceso
        if (isCobrador && targetUrl.startsWith('/conductor')) {
          // Cobrador puede acceder a /conductor
          return true;
        } else if (!isCobrador && targetUrl.startsWith('/tabs')) {
          // Usuarios normales pueden acceder a /tabs
          return true;
        }

        // Si no cumple ninguna de las reglas, redirigir según rol
        this.router.navigate(isCobrador ? ['/conductor'] : ['/tabs']);
        return false;
      }),
      catchError((error) => {
        console.error('Error en AuthGuard:', error);
        this.router.navigate(['/login']); // Redirigir al login en caso de error
        return of(false);
      })
    );
  }
}
