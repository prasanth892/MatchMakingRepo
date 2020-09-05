import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { AlertifyService } from './alertify.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHepler = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  newUnreadMessages = new BehaviorSubject(false);

  constructor(private http: HttpClient, private alertifyService: AlertifyService,
    private router: Router) {}

  changeMemberPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }


  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model).pipe(
      map((res: any) => {
        const user = res;
        if (user) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user.user));
          this.decodedToken = this.jwtHepler.decodeToken(user.token);
          this.currentUser = user.user;
          this.changeMemberPhoto(this.currentUser.photoUrl
            );
        }
      })
    );
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHepler.isTokenExpired(token);
  }

  register(user: User) {
    return this.http.post(this.baseUrl + 'register', user);
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('recUsers');
    this.decodedToken = null;
    this.currentUser = null;
    this.alertifyService.error('Logout');
    this.router.navigate(['/home']);
    return false;
  }
}
