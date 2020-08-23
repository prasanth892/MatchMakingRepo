import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss'],
})
export class MemberDetailComponent implements OnInit {
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
    private route: ActivatedRoute
  ) {}

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
          width: '500px',
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
