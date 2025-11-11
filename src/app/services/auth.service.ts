import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private serverUrl = environment.serverUrl ?? ''; // If blank, fallback to local mode
  private usernameSource = new BehaviorSubject<string | null>(null);
  username = this.usernameSource.asObservable();

  constructor(private http: HttpClient) {
    // load saved username from localStorage if available
    const saved = localStorage.getItem('username');
    if (saved) {
      this.usernameSource.next(saved);
    }
  }

  /** ✅ Shared username logic */
  private setUsername(username: string): void {
    this.usernameSource.next(username);
    localStorage.setItem('username', username);
  }

  private clearUsername(): void {
    this.usernameSource.next(null);
    localStorage.removeItem('username');
  }

  // ==========================================================================================
  // PERMANENT (BACKEND) SECTION
  // ==========================================================================================
  register(user: any): Observable<any> {
    return this.http.post(`${this.serverUrl}/users/register`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res?.name) this.setUsername(res.user.name);
      }),
      catchError(err => throwError(() => err))
    );
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.serverUrl}/users/login`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        console.log('Username response:', res?.user.name);
        console.log('Full response:', res);
        if (res?.user.name) {
          this.setUsername(res.user.name);
        } else {
          this.setUsername('User'); // Fallback if name is missing
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): Observable<any> {
    if (!this.serverUrl) {
      this.clearUsername();
      return of({ message: 'Logged out (local mode)' });
    }
    return this.http.get(`${this.serverUrl}/users/logout`, { withCredentials: true }).pipe(
      tap(() => this.clearUsername()),
      catchError(err => {
        this.clearUsername();
        return throwError(() => err);
      })
    );
  }

  // ==========================================================================================
  // TEMPORARY (NO BACKEND) SECTION
  // ==========================================================================================
  // private registerLocal(user: any): Observable<any> {
  //   const users = JSON.parse(localStorage.getItem('users') || '[]');
  //   if (users.find((u: any) => u.email === user.email)) {
  //     return throwError(() => ({ error: { message: 'Email already registered (local mode)' } }));
  //   }
  //   users.push(user);
  //   localStorage.setItem('users', JSON.stringify(users));
  //   this.setUsername(user.name);
  //   return of({ message: 'Registered locally', username: user.name });
  // }

  // private loginLocal(user: any): Observable<any> {
  //   const users = JSON.parse(localStorage.getItem('users') || '[]');
  //   const found = users.find((u: any) => u.email === user.email && u.password === user.password);
  //   if (!found) {
  //     return throwError(() => ({ error: { message: 'Invalid credentials (local mode)' } }));
  //   }
  //   this.setUsername(found.name);
  //   return of({ message: 'Logged in locally', username: found.name });
  // }
}
