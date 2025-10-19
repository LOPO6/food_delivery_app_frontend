import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  isLogin: boolean = true;

  email: string = '';
  password: string = ''

  name: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  showLogin() { this.isLogin = true; }
  showRegister() { this.isLogin = false; }


   onLogin(form: NgForm) {
    if (!form.valid) return;

    this.http.post('http://localhost:3000/api/users/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
       alert('Login successful!');
      },
      error: (err) => alert(err.error?.message || 'Login failed')
    });
  }

  onRegister(form: NgForm) {
    if (!form.valid) return;


    this.http.post('http://localhost:3000/api/users/register', {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        alert('Registration successful! You can now log in.');
        this.isLogin = true;
      },
      error: (err) => alert(err.error?.message || 'Registration failed')
    });
  }


  }
