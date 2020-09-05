import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { RecommedUser } from '../_models/recommedUser';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  photoUrl: string;
  activeUser: User;
  recommendedUsers : RecommedUser[];
  unreadMsg = false;
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';
  constructor(public authService: AuthenticationService, private alertify: AlertifyService,
              private router: Router, private userService: UserService) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.activeUser = JSON.parse(localStorage.getItem('user'));

  //   this.userService.getMessages(
  //     this.authService.decodedToken.nameid, 1, 1, {})
  // .subscribe((res: any) => {
  //     this.messages = res.result;
  //     if(this.messages.length > 0){
  //       this.unreadMsg = true;
  //       console.log(this.unreadMsg)
  //     }
  //     });

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
      this.userService.getRecommendation(this.authService.decodedToken.nameid).subscribe((res: RecommedUser[]) => {
        this.recommendedUsers = res;
        this.recommendedUsers.sort((a, b) => (a.matchingPercent < b.matchingPercent) ? 1 : -1)
        localStorage.setItem('recUsers' ,JSON.stringify(this.recommendedUsers));
        console.log(localStorage.getItem('recUsers'));
      });
    });
  }

  loggedIn(){
    return this.authService.loggedIn();
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('recUsers');
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
