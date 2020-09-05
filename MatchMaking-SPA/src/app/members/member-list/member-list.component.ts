import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination, PaginatedResult } from 'src/app/_models/pagination';
import { Country } from '@angular-material-extensions/select-country';
import { CountryList } from 'src/app/_helpers/countryList';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
  pagination: Pagination;
  users: User[];
  user = JSON.parse(localStorage.getItem('user'));
  countryList = new CountryList().countryLists;
  userParams: any = {};
  showAdvancedSearch =false;
  searchedUser: User;
  searchString = '';

  constructor(private userService: UserService, private alertify: AlertifyService,
              private route: ActivatedRoute, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    if(this.showAdvancedSearch === false){
    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data['users'].pagination;
    });

    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 69;
    this.userParams.country = 'Sri Lanka';

    this.loadUsers();
  }
  }

  resetFilter() {
    this.userParams.gender = this.user.gender === 'female' ? 'male' : 'female';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 69;
    this.userParams.orderBy = 'lastActive';

    if(this.showAdvancedSearch === false){
    this.loadUsers();
    }
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    if(this.showAdvancedSearch === false){
    this.loadUsers();
    }
  }

  loadUsers() {
    // console.log(this.userParams);
      this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
      .subscribe( (res: PaginatedResult<User[]>) => {
      this.users = res.result;
      this.pagination = res.pagination;
      this.spinner.hide();
    }, error => {
      this.alertify.error(error);
    });
  }

  toggleAdvancedSearch() {
    this.searchedUser = null;
    return this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  searchUser(){
    this.users = null;

    if(this.searchString !== ''){
      this.userService.searchUser(this.user.Id, this.searchString).subscribe((res: User) => {
        this.searchedUser = res;
        this.alertify.success('Match Found');
      }, error => {
        this.alertify.error(error);
        this.searchedUser = null;
      }, () => {
        this.showAdvancedSearch =true;
      });
    }
  }



}
