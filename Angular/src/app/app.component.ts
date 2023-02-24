import { Component } from '@angular/core';
import { dateInputsHaveChanged } from '@angular/material/datepicker/datepicker-input-base';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { delay, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SensorsComponent } from './sensors/sensors.component';
import { SettingsComponent } from './settings/settings.component';
import { INotification } from './shared/models/INotification';
import { ISensor } from './shared/models/ISensor';
import { IUser } from './shared/models/IUser';
import { AuthentificationService } from './shared/services/authentification.service';
import { EmailService } from './shared/services/email.service';
import { NotificationsService } from './shared/services/notifications.service';
import { SensorsService } from './shared/services/sensors.service';
import { SharedService } from './shared/services/shared.service';
import { SignalrService } from './shared/services/signalr.service';
import { UpdateSensorComponent } from './update-sensor/update-sensor.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sensors';

  isLogged : boolean = false;
  user : IUser = { username: "", password: "" };

  constructor(
    private dialog : MatDialog, 
    private sensorsService : SensorsService,
    private notificationsService : NotificationsService,
    private emailServices : EmailService,
    private snackBar: MatSnackBar,
    private route : Router,
    private socketService : SignalrService,
    private authServis : AuthentificationService,
    private router : Router, private _sharedService : SharedService, private location : Location)
  {
    //sessionStorage.removeItem("username");
    //sessionStorage.removeItem("password");
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    this.isLogged = (username && password) ? true : false;  

    location.onUrlChange((url) => {

      console.log('Promjena putanje: '+ url)
      let username = sessionStorage.getItem("username");
      let password = sessionStorage.getItem("password");
      this.isLogged = (username && password) ? true : false;
    });

    _sharedService.changeEmitted$.subscribe((objekt) => {
      console.log("EMIT " + objekt.user);
      this.user = objekt.user;
      //environment.username = this.user.username;
      //environment.password = this.user.password;
      sessionStorage.setItem("username", this.user.username);
      sessionStorage.setItem("password", this.user.password);
      this.isLogged = true;
    });
  }

  ngOnInit()
  {
    this.socketService.buildConnection();
  }

  openSettingsWindow()
  {
    this.dialog.open(SettingsComponent);
  }

  logout()
  {
    //environment.username = "";
    //environment.password = "";
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
    this.isLogged = false;
    this.router.navigate(['/login']);
  }

}
