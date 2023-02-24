import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component.js';
import './../../../assets/smtp.js';  

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private snackBar: MatSnackBar){}

  sendEmailSmtp(sender : string, receiver : string, title : string, message : string, numberOfEmailsSent? : number)
  {
    Email.send({
      Host : 'smtp.elasticemail.com',
      Username : '',
      Password : '',
      To : receiver,
      From : sender,
      Subject : title,
      Body : message
      }).then( 
        (result: any) => {
          if (result == "OK")
          {
            let text = `Sent alert from ${sender} to ${receiver}`;
            if (numberOfEmailsSent && numberOfEmailsSent > 0)
              text += `. Number of emails sent: ${numberOfEmailsSent}`;
            this.snackBar.open(text, "Ok");
          }
          else
            this.snackBar.open(`Something went wrong with sending an alert - status: ${result}`, "Ok");
        } 
      );
  }

 
}
