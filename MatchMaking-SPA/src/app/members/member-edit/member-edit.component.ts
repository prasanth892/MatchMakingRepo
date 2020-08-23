import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/_services/user.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';



@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent implements OnInit {
user: User;
clickedInterests = false;
@ViewChild('memberEditForm', {static: true}) memberEditForm: NgForm;

@HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
  if (this.memberEditForm.dirty) {
    $event.returnValue = true;
  }
}


  constructor(private route: ActivatedRoute, private alertify: AlertifyService,
              private userService: UserService, private authService: AuthenticationService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data.user;
    });
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
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe(next => {
      this.alertify.success('Profile updated successfully');
      this.clickedInterests = false;
      console.log(this.user);
      this.memberEditForm.reset(this.user);
    }, error =>  {
      this.alertify.error(error);
    });

  }

  clickInterests() {
    this.clickedInterests = true;
  }

}
