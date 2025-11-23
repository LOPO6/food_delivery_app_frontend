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
  private userSource = new BehaviorSubject<any | null>(null);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient) {
    // load saved username from localStorage if available
    const saved = localStorage.getItem('username');
    if (saved) {
      this.usernameSource.next(saved);
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { this.userSource.next(JSON.parse(userStr)); } catch { this.userSource.next(null); }
    }
  }

  // Fetch a user's profile by id
  getProfile(userId: string | number) {
    return this.http.get(`${this.serverUrl}/users/profile/${userId}`, { withCredentials: true });
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
        if (res?.name) {
          // Set the observable username
          this.setUsername(res.user.name);
          // Save user details to localStorage
          localStorage.setItem('user', JSON.stringify(res?.user));
          if (res?.token) localStorage.setItem('token', res.token);
          this.userSource.next(res?.user);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // A method to update user details
  updateUser(user: any): Observable<any> {
    console.log('Updating user with ID:', user.user_id);
    return this.http.put(`${this.serverUrl}/users/${Number(user.user_id)}`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res) this.setUsername(user.name);

      }),
      catchError(err => throwError(() => err))
    );
  }

  // A method to log in a user
  login(user: any): Observable<any> {
    return this.http.post(`${this.serverUrl}/users/login`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        console.log('Username response:', res?.user.name);
        console.log('Full response:', res);
        if (res?.user.name) {
          // Set the observable username
          this.setUsername(res.user.name);
          // Save user details to localStorage
          localStorage.setItem('user', JSON.stringify(res?.user));
          if (res?.token) localStorage.setItem('token', res.token);
          this.userSource.next(res?.user);
        } else {
          this.setUsername('User'); // Fallback if name is missing
          this.userSource.next(null);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  // A method to log out a user
  logout(): Observable<any> {
    localStorage.clear();
    if (!this.serverUrl) {
      this.clearUsername();
      this.userSource.next(null);
      return of({ message: 'Logged out (local mode)' });
    }
    return this.http.post(`${this.serverUrl}/users/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearUsername()),
      catchError(err => {
        this.clearUsername();
        return throwError(() => err);
      })
    );
  }

    // A method to get the current user's ID from localStorage
    getCurrentUserId(): string {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).user_id : '';
    console.log('Current User ID:', userId);
    return userId;
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
