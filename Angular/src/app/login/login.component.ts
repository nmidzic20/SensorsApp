import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { IUser } from '../shared/models/IUser';
import { AuthentificationService } from '../shared/services/authentification.service';
import { SharedService } from '../shared/services/shared.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username? : string;
  password? : string;
  message = "";

  ngOnInit() {}

  @Output() loginSuccessful = new EventEmitter<string>();

  constructor(
    public dialog : MatDialog,
    private authServis : AuthentificationService,
    private router : Router,
    private _sharedService: SharedService) 
  {}

  login()
  {
    this.message = "";
    console.log("Submitted " + this.username + " " + this.password);

    if(this.username == undefined || this.containsWhitespace(this.username))
    {
      this.message += "Enter username<br>";
    }

    if (this.password == undefined || this.containsWhitespace(this.password))
    {
      this.message += "Enter password<br>";
    }

    if (this.message != "")
      this.openMessageDialog();
    else
      this.checkLoginData();

  }

  containsWhitespace(str : string)
  {
    return /^\s*$/.test(str);
  }

  checkLoginData()
  {
    this.authServis.getUser(this.username!, this.password!).subscribe({
      next : (user : IUser) => {
        console.log("Login? " + user);

        if (user != null)
        {
          this._sharedService.emitChange({"user": user});
          this.router.navigateByUrl("/sensors");
        }
        else
        {
          this.message = "Incorrect login data";
          this.openMessageDialog();
        }
      }
  });
    
  }

  openMessageDialog()
  {
    this.dialog.open(MessageDialogComponent, { data: {"message": this.message, "title": "Login message"} });
  }

}
