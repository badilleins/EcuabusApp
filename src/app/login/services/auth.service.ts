import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { forkJoin, map, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRole: string | null = null;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) { }

  // Login
  async login(email: string, password: string): Promise<any> {
    try {
      const user = await this.afAuth.signInWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Login con Google
  async googleLogin(): Promise<any> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const user = await this.afAuth.signInWithPopup(provider);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Inicio de sesión con Facebook
  async facebookLogin(): Promise<any> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const user = await this.afAuth.signInWithPopup(provider);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    await this.afAuth.signOut();
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.afAuth.authState;
  }

  getUserProfile(): Observable<any | null> {
  return this.afAuth.authState.pipe(
    switchMap(user => {
      if (!user) {
        return of(null);
      }
      return this.firestore.collection('users').doc(user.uid).valueChanges();
    })
  );
}


  async setPersistence() {
    await this.afAuth.setPersistence('local');
  }

  getCurrentUserDisplayName(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => user ? user.displayName || user.email : null)
    );
  }

  checkIfUserIsCobrador(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.afAuth.authState.subscribe((user) => {
        if (!user) {
          observer.next(false);
          observer.complete();
          return;
        }

        const userEmail = user.email;

        // Buscar directamente en la colección 'users'
        this.firestore
          .collection('users', (ref) => ref.where('email', '==', userEmail))
          .get()
          .subscribe((userSnapshot) => {
            if (userSnapshot.empty) {
              observer.next(false);
              observer.complete();
              return;
            }

            // Verificar si alguno de los documentos tiene el rol 'Cobrador'
            const isCobrador = userSnapshot.docs.some(
              (doc) => (doc.data() as { rol: string }).rol === 'Cobrador'
            );


            observer.next(isCobrador);
            observer.complete();
          });
      });
    });
  }

  fetchUserRole(): Observable<string | null> {
  return this.afAuth.authState.pipe(
    switchMap(user => {
      if (!user) return of(null);

      const userId = user.uid;

      // Buscar en 'users'
      return this.firestore.collection('users').doc(userId).valueChanges().pipe(
        switchMap((profile: any) => {
          if (profile && profile.rol) {
            this.userRole = profile.rol;
            return of(this.userRole);
          } else {
            // Si no está en users, buscar en clients
            return this.firestore.collection('clients').doc(userId).valueChanges().pipe(
              map(clientProfile => {
                if (clientProfile) {
                  // Si existe en clients, asumimos que es cliente
                  this.userRole = 'cliente';
                } else {
                  this.userRole = null;
                }
                return this.userRole;
              })
            );
          }
        })
      );
    })
  );
}

  getRole(): string | null {
    return this.userRole;
  }

  isClienteOrTaquillero(): boolean {
    return this.userRole === 'cliente' || this.userRole === 'taquillero';
  }

  isConductorOrCobrador(): boolean {
    return this.userRole === 'conductor' || this.userRole === 'cobrador';
  }
}
