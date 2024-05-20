import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {Router} from '@angular/router'
//Finished service class which can handle authentication and other user related functionalities
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token!: string | null;

  constructor(private http: HttpClient, private router: Router) { }

  register(user: any){
    return this.http.post('/api/register', user)
  }

  login(user: any){
    return this.http.post('/api/login', user);
  }

  logout(){
    this.token = null;
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  saveToken(token: string){
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(){
    return this.token || localStorage.getItem('token');
  }
}
