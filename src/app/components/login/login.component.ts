import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


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

  constructor(private router: Router, private authService: AuthService) {}  // ✅ inject service

  showLogin() { this.isLogin = true; }
  showRegister() { this.isLogin = false; }

  // ✅ Register (works with backend or local fallback)
  onRegister(form: NgForm) {
    if (!form.valid) return;

    const user: User = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(user).subscribe({
      next: () => {
        alert('Account created! You can now log in.');
        this.isLogin = true;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Registration failed';
        alert(msg);
      }
    });
  }

  // ✅ Login (works with backend or local fallback)
  onLogin(form: NgForm) {
    if (!form.valid) return;

    const user: User = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.login(user).subscribe({
      next: (res: any) => {
        alert(`Welcome back, ${res?.username || user.name}!`);
        this.router.navigate(['/restaurant']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Invalid email or password';
        alert(msg);
      }
    });
  }
}
