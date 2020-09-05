import { Injectable } from '@angular/core';
import { User } from '../_models/user';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()

export class RecommenderResolver implements Resolve<User[]> {
  // pageNumber = 1;
  // pageSize = 12;
    constructor(private userService: UserService, private router: Router,
                private alertifyService: AlertifyService, private authService: AuthenticationService ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<User[]> {

        return this.userService.getRecommendation(this.authService.decodedToken.nameid)
               .pipe(
                   catchError( error => {
                       this.alertifyService.error('Problems in retriving data');
                       this.router.navigate(['/home']);
                       return of(null);
                   })
               );
    }
}

