import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { UserService } from '../_services/user.service';
import { AuthenticationService } from '../_services/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { Pagination } from '../_models/pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
      private userService: UserService, private authService: AuthenticationService,
      private route: ActivatedRoute, private alertify: AlertifyService
  ) {}

  ngOnInit() {
      this.route.data.subscribe(data => {
          this.messages = data['messages'].result
          this.pagination = data['messages'].pagination
      })

  }

  loadMessages(btnName?) {
      this.userService
          .getMessages(
              this.authService.decodedToken.nameid, this.pagination.currentPage,
              this.pagination.itemsPerPage, this.messageContainer)
          .subscribe((res: any) => {
                  this.messages = res.result
                  this.pagination = res.pagination
              },error => {
                this.alertify.error(error.error)
              }
          );
  }

  pageChanged(event: any): void {
      this.pagination.currentPage = event.page
      this.loadMessages()
  }


}
