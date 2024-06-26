import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] 
})
export class LoginComponent {
  username!: string;
  password!: string;

  constructor(private authService: AuthService, private router: Router) {
  }

  login() {
    this.authService.login({ username: this.username, password: this.password }).subscribe(
      (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/sql-editor']); 
      }, 
      (error) => {
        console.error('Login failed', error);
      }
    );
  }

  redirectToRegister(){
    this.router.navigate(['/register']);
  }
}
