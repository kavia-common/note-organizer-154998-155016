import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  mode: 'login' | 'signup' = 'login';
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = null;
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }
    this.loading = true;
    try {
      if (this.mode === 'login') {
        await this.auth.login(this.email, this.password);
      } else {
        await this.auth.signup(this.email, this.password);
      }
      await this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e?.message || 'Failed to authenticate';
    } finally {
      this.loading = false;
    }
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
  }
}
