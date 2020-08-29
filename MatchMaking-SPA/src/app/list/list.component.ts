import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  likesParam: string;
  constructor(private authService: AuthenticationService, private userService: UserService,
    private router: ActivatedRoute, private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.router.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data['users'].pagination;
    });
    this.likesParam = 'Likers';
  }


  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  loadUsers() {
      this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, null,  this.likesParam)
      .subscribe( (res: PaginatedResult<User[]>) => {
      this.users = res.result;
      this.pagination = res.pagination;
      console.log(this.users);
    }, error => {
      this.alertifyService.error(error);
    });
  }


}
