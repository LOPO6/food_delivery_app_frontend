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
  email: string = '';
  password: string = ''

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/users/login', loginData)
    .subscribe({
      next: (res: any) => {
        // Successful login – store token and navigate
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home']); 
        alert("Login successful");
      },
      error: (err) => {
        alert(err.error?.message || "Invalid login credentials");
      }
    });
  }

  }
