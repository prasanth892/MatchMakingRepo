import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { User } from 'src/app/_models/user';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { RecommedUser } from 'src/app/_models/recommedUser';

import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-recommender',
  templateUrl: './recommender.component.html',
  styleUrls: ['./recommender.component.scss']
})
export class RecommenderComponent implements OnInit {

  recommendedUsers : RecommedUser[];
  showLoading = true;
  constructor(private userService: UserService, private alertify: AlertifyService,
    private route: ActivatedRoute, private authService: AuthenticationService,
    private spinner: NgxSpinnerService ) { }
  ngOnInit() {
    this.spinner.show();
    delay(20000);
    if (JSON.parse(localStorage.getItem('recUsers')) === null){
      this.loadUsers(this.authService.decodedToken.nameid);

    } else {
      this.recommendedUsers = JSON.parse(localStorage.getItem('recUsers'));

      if(this.recommendedUsers !== null) {
          this.spinner.hide();
      }
    }
  }
  loadUsers(id) {
      this.userService.getRecommendation(id)
      .subscribe((res: RecommedUser[]) => {
      this.recommendedUsers = res;
      this.recommendedUsers.sort((a, b) => (a.matchingPercent < b.matchingPercent) ? 1 : -1)
      localStorage.setItem('recUsers' ,JSON.stringify(this.recommendedUsers));
      this.spinner.hide();
    }, error => {
      this.alertify.error(error);
    });
  }

  sendLike(id: number) {
    // this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
    //   this.alertify.success('You have liked  ' + this.user.knownAs);
    // }, error => {
    //   this.alertify.error(error);
    // });
  }
}
