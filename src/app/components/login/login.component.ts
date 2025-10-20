import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

interface User {
  name: string;
  email: string;
  password: string;
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // State
  isLogin = true;
  email = '';
  password = '';
  name = '';

  constructor(private router: Router) {}

  showLogin() { this.isLogin = true; }
  showRegister() { this.isLogin = false; }

  // ✅ Register locally
  onRegister(form: NgForm) {
    if (!form.valid) return;

    const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = storedUsers.find(u => u.email === this.email);

    if (exists) {
      alert('Email already registered!');
      return;
    }

    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    storedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(storedUsers));

    alert('Account created! You can now log in.');
    this.isLogin = true;
  }

  // ✅ Login locally
  onLogin(form: NgForm) {
    if (!form.valid) return;

    const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = storedUsers.find(
      u => u.email === this.email && u.password === this.password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      alert(`Welcome back, ${user.name}!`);
      this.router.navigate(['/restaurant']);  // redirect anywhere you want
    } else {
      alert('Invalid email or password');
    }
  }
}
