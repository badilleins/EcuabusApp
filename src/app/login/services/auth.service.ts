import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

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

  async setPersistence() {
    await this.afAuth.setPersistence('local');
  }

  getCurrentUserDisplayName(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => user ? user.displayName || user.email : null)
    );
  }




}
