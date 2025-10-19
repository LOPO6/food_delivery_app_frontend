import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; //need to set apiUrl in there

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private serverUrl = environment.serverUrl ?? ''; // set apiUrl in src/environments/environment.ts
  private usernameSource = new BehaviorSubject<string | null>(null);
  username = this.usernameSource.asObservable();

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('username');
    if (saved) {
      this.usernameSource.next(saved);
    }
  }

  setUsername(username: string): void {
    this.usernameSource.next(username);
    localStorage.setItem('username', username);
  }

  clearUsername(): void {
    this.usernameSource.next(null);
    localStorage.removeItem('username');
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.serverUrl}/users/register`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        // May need to be adjusted based on backend response structure
        if (res?.username) {
          this.setUsername(res.username);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  login(user: any): Observable<any> {
   return this.http.post(`${this.serverUrl}/users/login`, user, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res?.username) {
          this.setUsername(res.username);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }
  logout(): Observable<any> {
    return this.http.get(`${this.serverUrl}/users/logout`, { withCredentials: true }).pipe(
      tap(() => this.clearUsername()),
      catchError(err => {
        this.clearUsername();
        return throwError(() => err);
      })
    );
  }
}
