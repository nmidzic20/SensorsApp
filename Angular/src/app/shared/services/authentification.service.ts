import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUser } from '../models/IUser';
import { MatSnackBar } from '@angular/material/snack-bar';

const apiUrl = environment.apiUrl;
const url = `${apiUrl}api/Users`;

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  constructor(private http : HttpClient, private snackbar : MatSnackBar) { }

  getUser(username : string, password : string): Observable<IUser> 
  {
    return this.http.get<IUser>(`${url}/${username}`)
      .pipe(
        tap(data => {
          console.log('getUser: ' + JSON.stringify(data));
          //environment.username = data.username;
          //environment.password = data.password;
          sessionStorage.setItem("username", data.username);
          sessionStorage.setItem("password", data.password);

          //this.snackbar.open(environment.username + " " + environment.password, "Ok");
        })
      );
  }
}
