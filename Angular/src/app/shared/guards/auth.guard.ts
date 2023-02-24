import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthentificationService } from '../services/authentification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService : AuthentificationService, private router : Router, private snackbar : MatSnackBar) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
  {
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let isLogged = (username && password) ? true : false;//(environment.username != "" && environment.password != "") ? true : false;

    //this.snackbar.open(username + " " + password + " " + isLogged, "Ok");

    if (!isLogged)
      this.router.navigateByUrl("/login");

    return isLogged;
  }
  
}
