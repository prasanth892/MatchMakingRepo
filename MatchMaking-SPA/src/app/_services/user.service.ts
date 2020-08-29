import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { map } from 'rxjs/operators';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization : 'Bearer ' + localStorage.getItem('token')
//   })
// };

@Injectable({
  providedIn: 'root'
})
export class UserService {

baseUrl = environment.apiUrl;
constructor(private http: HttpClient) { }

// getUsers(): Observable<User[]> {
//   const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
//   return this.http.get<User[]>(this.baseUrl + 'user/GetUsers');
// }

getUsers(page?, itemsPerPage?,  userParams?, likesParams?): Observable<PaginatedResult<User[]>> {
  const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

  let params = new HttpParams()

  if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page),
      params = params.append('pageSize', itemsPerPage)
  }

  if(userParams != null){
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
      params = params.append('country', userParams.country);
  }

  if (likesParams === 'Likers') {
     params = params.append('likers', 'true');
  }

  if (likesParams === 'Likees') {
      params = params.append('likees', 'true');
   }


  return this.http.get<User[]>(this.baseUrl + 'user/getusers', { observe: 'response', params })
      .pipe(
          map(response => { paginatedResult.result = response.body
              if (response.headers.get('Pagination') != null) {
                  paginatedResult.pagination = JSON.parse(
                  response.headers.get('Pagination'))
                  console.log(paginatedResult);
              }
              return paginatedResult
          })
      );
}

getUser(id): Observable<User> {
  return this.http.get<User>(this.baseUrl + 'user/getuser/' + id);
}

updateUser(id: number, user: User) {
  return this.http.put(this.baseUrl + 'user/updateuser/' + id, user);
}


setMainPhoto(userId: number, id: number) {
  return this.http.post(
      this.baseUrl + 'users/' + userId + '/photoes/' + id + '/setMain',
      {}
  );
}

deletePhoto(userId: number, id: number) {
  return this.http.delete(this.baseUrl + 'users/' + userId + '/photoes/' + id);
}

sendLike(id: number, recipientId: number) {
  return this.http.post(this.baseUrl + 'user/' + id + '/like/' + recipientId, {});
}

}
