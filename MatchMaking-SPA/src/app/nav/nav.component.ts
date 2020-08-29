import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { User } from '../_models/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  photoUrl: string;
  activeUser: User;
  constructor(public authService: AuthenticationService, private alertify: AlertifyService,
              private router: Router) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.activeUser = JSON.parse(localStorage.getItem('user'));

  }

  gotoRegistrationPage() {
    if(this.authService.loggedIn()) {
      this.router.navigate(['members/']);
      return false;
    }

    this.router.navigate(['home/']);
    return false;

  }

  login(){
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in Succcessfully');
    }, error  => {
      this.alertify.error(error);
    }, () => {
      this.router.navigate(['/members']);
    });
  }

  loggedIn(){
    return this.authService.loggedIn();
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodedToken = null;
    this.authService.currentUser = null;
    this.alertify.error('Logout');
    this.router.navigate(['/home']);
    return false;
  }

    clicking(){
      alert('hola');
    }
}
