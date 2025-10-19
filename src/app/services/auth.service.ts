import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
//need to import environment file here

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //need serverUrl here
  private usernameSource = new BehaviorSubject<string | null>(null);
  username = this.usernameSource.asObservable();

  setUsername(username: string): void{
    this.usernameSource.next(username);
  }

  clearUsername():void{
    this.usernameSource.next(null)
  }
  constructor(private http: HttpClient) { }

  register(user:any){
    //return this.http.post(`${this.serverUrl}/users/login`, user, {withCredentials: true}); need serverUrl variable set to uncomment this
  }

  login(user: any){
    // return this.http.post(`${this.serverUrl}/users/login`, user, {withCredentials: true});
  }
  logout(){
    //return this.http.get(`${this.serverUrl}/users/logout`, {wityhCredentials: true});
  }
}
