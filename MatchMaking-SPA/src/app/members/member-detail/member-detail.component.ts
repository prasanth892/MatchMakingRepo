import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import {TimeAgoPipe} from 'time-ago-pipe';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit {
@ViewChild('memberTabs') memberTabs: TabsetComponent;
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  movies;
  tv;
  relegion;
  music;
  sports;
  books;
  politics;

  constructor(
    private userService: UserService, private alertifyService: AlertifyService,
    private route: ActivatedRoute, private authService: AuthenticationService) {}

    ngAfterViewInit() {
      this.route.queryParams.subscribe(params => {
        const selectedTab = params['tab'];
        console.log('selcted tab: ' + this.selectTab);
        this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
      });

    }
  ngOnInit() {
    // this.loadUser();




    this.route.data.subscribe((data) => {
      this.user = data['user'];
      this.movies = (+this.user.movies + 1) * 10;
      this.tv = (+this.user.tv + 1) * 10;
      this.relegion = (+this.user.religion + 1) * 10;
      this.music = (+this.user.music + 1) * 10;
      this.sports = (+this.user.sports + 1) * 10;
      this.books = (+this.user.books + 1) * 10;
      this.politics = (+this.user.politics + 1) * 10;
    });


    this.galleryOptions = [
      {
          width: '100%',
          height: '500px',
          thumbnailsColumns: 4,
          imageAnimation: NgxGalleryAnimation.Slide,
          preview: false

      }
  ];

    this.galleryImages = this.getImages();
    console.log(this.getImages());



  }
  getImages(){
    const imageUrls = [];
    for (let i = 0; i < this.user.photos.length; i++) {
      imageUrls.push({
        small: this.user.photos[i].url,
        medium: this.user.photos[i].url,
        big: this.user.photos[i].url,
        description: this.user.photos[i].description
      });
    }
    return imageUrls;
  }

  sendLike(id: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
      this.alertifyService.success('You have liked  ' + this.user.knownAs);
    }, error => {
      this.alertifyService.error(error);
    });
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  // loadUser() {
  //   this.userService.getUser(+this.route.snapshot.params['id']).subscribe(
  //     (next: User) => {
  //       this.user = next;
  //       this.movies = (+this.user.movies + 1) * 10;
  //       this.tv = (+this.user.tv + 1) * 10;
  //       this.relegion = (+this.user.religion + 1) * 10;
  //       this.music = (+this.user.music + 1) * 10;
  //       this.sports = (+this.user.sports + 1) * 10;
  //       this.books = (+this.user.books + 1) * 10;
  //       this.politics = (+this.user.politics + 1) * 10;
  //     }, error => {
  //       this.alertifyService.error(error);
  //     });
  // }
}
