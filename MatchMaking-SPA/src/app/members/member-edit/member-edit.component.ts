import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { User } from 'src/app/_models/user';
import { ActivatedRoute, Router } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/_services/user.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RecommedUser } from 'src/app/_models/recommedUser';
import { CountryList } from 'src/app/_helpers/countryList';



@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent implements OnInit {
user: User;
clickedInterests = false;
countryList = new CountryList().countryLists;
photoUrl: string;
@ViewChild('memberEditForm', {static: true}) memberEditForm: NgForm;

@HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
  if (this.memberEditForm.dirty) {
    $event.returnValue = true;
  }
}


  constructor(private route: ActivatedRoute, private alertify: AlertifyService, private spinner: NgxSpinnerService,
              private userService: UserService, private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
    this.spinner.show();
    this.route.data.subscribe(data => {
      this.user = data.user;
      this.spinner.hide();
    });
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);

  }


  changeToZero(interest) {

    switch (interest) {
      case 'movies': {
        this.user.movies = '0';
        break;
      }
      case 'tv': {
        this.user.tv = '0';
        break;
      }
      case 'relegion': {
        this.user.religion = '0';
        break;
      }
      case 'music': {
        this.user.music = '0';
        break;
      }
      case 'sports': {
        this.user.sports = '0';
        break;
      }
      case 'books': {
        this.user.books = '0';
        break;
      }
      case 'politics': {
        this.user.politics = '0';
        break;
      }
   }
  }
  updateUser() {
    this.spinner.show();
    localStorage.removeItem('recUsers');
      this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe((res: RecommedUser[]) => {
      this.alertify.success('Profile updated successfully');
      this.clickedInterests = false;
      this.memberEditForm.reset(this.user);
      // res.sort((a, b) => (a.matchingPercent < b.matchingPercent) ? 1 : -1)
      // localStorage.setItem('recUsers' ,JSON.stringify(res));
      // console.log('Updated sccccccccccccccccc');
      // this.spinner.hide();

    }, error =>  {
      this.alertify.error(error);
    },() => {
      this.router.navigate(['/recommend']);
    });
  }



  clickInterests() {
    this.clickedInterests = true;
  }

  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }

}
