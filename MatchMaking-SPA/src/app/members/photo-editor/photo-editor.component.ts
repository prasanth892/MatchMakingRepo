import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/_services/user.service';


@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.scss']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photoes: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  currentMainPhoto: Photo;
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean;
  response: string;
  baseUrl = environment.apiUrl;

    constructor(private authService: AuthenticationService, private userService: UserService,
                private alertify: AlertifyService) {
      this.initializeUploader();
    }


  ngOnInit() {
  }


  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photoes',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024

    });


    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('username', localStorage.getItem('username'));
    };

    this.uploader.onSuccessItem = (item: any, resonse: any, status: any) => {

      if(resonse){
        const res: Photo = JSON.parse(resonse);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photoes.push(photo);
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }
      }
    }

    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false;};
  }

  setMainPhoto(photo: Photo) {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id)
    .subscribe(next => {
      this.currentMainPhoto = this.photoes.filter(p => p.isMain === true)[0];
      this.currentMainPhoto.isMain = false;
      photo.isMain = true;
      // this.getMemberPhotoChange.emit(photo.url);
      this.authService.changeMemberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
    }, error => {
       this.alertify.error(error);
    });
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Are you sure want to delete this photo..?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe( () => {
        this.photoes.splice(this.photoes.findIndex(p => p.id === id), 1);
        this.alertify.success('The photo has been deleted..!');
      }, error => {
        this.alertify.error('Failed to delete the photo');
      });
    });
  }
}
