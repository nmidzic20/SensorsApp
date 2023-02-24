import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import *  as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { ISocketNotifyMessage } from '../models/ISocketNotifyMessage';
import { EmailService } from './email.service';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection! : signalR.HubConnection;
  connectionAttempts : number = 0;
  isConnected = false;

  constructor(private snackbar : MatSnackBar, private emailServices : EmailService) { }

  public buildConnection() : void 
  {
    if (this.isConnected == false)
    {
      this.hubConnection = new signalR.HubConnectionBuilder().withUrl(`${apiUrl}appHub`).build();

      this.startConnection();

      this.hubConnection.on(`camundaMessageHub`, (data: ISocketNotifyMessage) => {
        console.log(`Socket message has been received: ${JSON.stringify(data)}`);
        this.snackbar.open(`Socket message has been received: ${JSON.stringify(data)}`, "Ok");

        //send mail here
        let sender = environment.sender;
        let receiver = environment.receiver;
        this.emailServices.sendEmailSmtp(sender, receiver, `Sensor ${data.sensorId} not working alert`, data.message);

      });
    }
  }

  private startConnection = () => {
    this.connectionAttempts++;

    this.hubConnection
      .start()
      .then(() => {
        this.connectionAttempts = 0; // jer smo se uspjeli povezati
        this.isConnected = true; //da se ne bi ponovno pokusalo spojiti
        console.log("Socket connection has been started");
      })
      .catch((err) => {
        console.log("Socket error while establishing connection: " + err);
        setTimeout(() => {
          this.startConnection();
        }, 5000);
      });
  }
}
