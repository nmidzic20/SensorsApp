import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INotification } from '../shared/models/INotification';
import { ISensorType } from '../shared/models/ISensorType';
import { NotificationsService } from '../shared/services/notifications.service';
import { SensorTypesService } from '../shared/services/sensor-types.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ISensor } from '../shared/models/ISensor';
import { SensorsService } from '../shared/services/sensors.service';
import { MatPaginator } from '@angular/material/paginator';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EmailService } from '../shared/services/email.service';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  displayedNotifications: INotification[] = [];
  allNotifications: INotification[] = [];

  allSensors? : ISensor[];

  initialSelection = [];
  allowMultiSelect = false;
  selection = new SelectionModel<INotification>(this.allowMultiSelect, this.initialSelection);

  displayedColumns: string[] = ['id', 'sensorId', 'status', 'dateTimeReceived', 'delete'];

  constructor(
    private router: Router, 
    private notificationsService: NotificationsService, 
    private sensorsService : SensorsService,
    private sensorTypesService : SensorTypesService,
    public dialog : MatDialog,
    private emailServices : EmailService) 
  { 
    this.getSensors();
    this.showSensorTypes();
    this.showNotifications();
  }

  ngOnInit()
  {
  }

  getSensors()
  {
    this.sensorsService.getSensors().subscribe({
      next: sensors => {
        this.allSensors = sensors;
        this.setDataSource();
      }
    });
  }

  onDeleteAllClick()
  {
    //variant with removing them from the view immediately
    this.displayedNotifications.splice(0);
    this.refreshTable();

    this.notificationsService.deleteAll().subscribe(deletedNotifications => {
      //variant with waiting a second or so for the response to come back and only then removing them from the view
      //this.displayedNotifications.splice(0);
      //this.refreshTable();
    });
  }


  showSensorTypes()
  {
    //fill select box with sensor type options available
    this.sensorTypesService.getSensorTypes().subscribe({
      next: sensorTypes => {
        this.sensorTypes = sensorTypes;
      },
      error: err => {
        console.log(`getSensorTypes subscribe -> error notification ${err}`);
      }
    });
  }

  showNotifications()
  {
    this.notificationsService.getNotifications().subscribe({
      next: notifications => {
        this.allNotifications = notifications.reverse();
        this.displayedNotifications = this.allNotifications.slice();
        this.setDataSource();
      },
      error: err => {
        console.log(`getNotifications subscribe -> error notification`);
      }
    });

  }

  @ViewChild('table') table! : MatTable<INotification>; 

  sortNotifications()
  {
    //clear the array before sorting
    this.displayedNotifications.splice(0); 
    //console.log("before " + this.displayedNotifications.length + " " + this.allNotifications.length);

    if (this.num)
    {
      this.allNotifications.forEach (
        notification => {
          if (notification.sensorId.toString().includes(this.num!.toString()))
            this.displayedNotifications.push(notification);
        }
      );
      //console.log("now " + this.displayedNotifications.length);
      this.refreshTable();

    }

    /*if (this.selectedSensorType)
    {
      console.log("Selected: " + this.selectedSensorType.description);
      this.displayedNotifications.forEach (
        notification => {
          this.sensorsService.getSensor(notification.sensorId).subscribe({
            next: sensor => {
              console.log(this.selectedSensorType!.id + " " + sensor.typeId);
              if (sensor.typeId == this.selectedSensorType!.id)
              {
                this.displayedNotifications.push(notification);
                this.refreshTable();
              }
            },
            
        });
        }
      );

    }*/

    if (!this.num && !this.selectedSensorType && !this.selectedOption)
    {
      this.displayedNotifications = this.allNotifications.slice();
      this.refreshTable();
    }

    
  }

  dataSource!: MatTableDataSource<INotification>;

  @ViewChild('paginator') paginator!: MatPaginator;

  setDataSource() 
  {

    this.dataSource = new MatTableDataSource<INotification>();
    this.dataSource.data = this.displayedNotifications;
    this.dataSource.paginator = this.paginator;
    //this.table.dataSource = dataSource;
  }

  refreshTable()
  {
    //update table data source - creating a new datasource is necessary, do not put displayedNotifications directly into table.dataSource!
    let dataSource = new MatTableDataSource<INotification>();
    dataSource.data = this.displayedNotifications;
    dataSource.paginator = this.paginator;
    this.table.dataSource = dataSource;
  }

  formatDate(datetime : string)
  {
    return new Date(Date.parse(datetime));
  }

  //

  sensorTypes? : Array<ISensorType>;
  selectedSensorType? : ISensorType;
  selectSortOptions : Array<string> = ["Date", "Sensor", "Sensor type"];
  selectedOption : string = this.selectSortOptions[0];
  selectedOptionValue : string = "d";
  selectedDate? : string;
  keywords? : string;
  num? : number;

  //@ViewChild('pagingNotifications') pagingNotifications! : PagingComponent;

  ngDoCheck()
  {
    //console.log("Statusi: " + this.selectedDate + " " + this.selectedSensorType?.description + " " + this.selectedOption + " " + this.keywords);
  }

  sortOptionChanged(selectedOption : any)
  {
    console.log(selectedOption);
    let val : string;
    switch(selectedOption)
    {
      case "Date": val = 'd'; break;
      case "Sensor": val = 's'; break;
      case "Sensor type": val = 't'; break;
    }
    this.selectedOption = selectedOption;
    this.selectedOptionValue = val!;
    console.log("val " + val! + " " + this.selectedOption + " " + this.selectedOptionValue);
    //this.dajFilmove(1);
  }

  sensorTypeSelected(selectedType : ISensorType)
  {
    console.log(selectedType.description);
    this.selectedSensorType = selectedType;
    console.log(this.selectedSensorType.description);
    this.sortNotifications();
  }

  dateSelected(selectedDate : any)
  {
    this.selectedDate = (selectedDate as string).split(" GMT")[0];
    console.log(this.selectedDate);
    //this.dajFilmove(1);
  }

  keywordChanged(keywords : any)
  {
    var num = keywords.replace(/[^0-9]/g, '');
    //keywords = parseInt(keywords);
    if (!num) num = null;

    console.log(num + " " + this.allNotifications.length);
    this.num = num;
    this.sortNotifications();
  }

  isUnexpectedValue(notification : INotification)
  {
    /*if (!this.allSensors)
      this.getSensors();

    console.log("ALL SENSORS " + this.allSensors?.length);
    let sensor = this.allSensors?.find(s => s.notifications!.some(n => n.id == notification.id));
    console.log("HELPPPP " + sensor + " " + notification.id);
    return notification.status < sensor!.typeLowestValueExpected! || notification.status > sensor!.typeHighestValueExpected! ? 'red' : '';
    */
   return '';

  }

  onDeleteClick(notificationId: number) 
  {
    this.notificationsService.deleteNotification(notificationId)
      .subscribe(response => {
        this.displayedNotifications = this.displayedNotifications.filter(notifcation => notifcation.id !== notificationId);
        this.refreshTable();
      });
  }


  async testAPI()
  {    
    let numberApiCalls = environment.numberApiCalls;

    let numberOfEmailsSent = 0;
    let newNotifications : INotification[] = [];

    let requests = [];

   //firefox works OK, chrome has a limit of about 1000 requests in a short amount of time - would need to make a batch of 1000, delay, and again

    for (let i = 0; i < numberApiCalls; i++)
    {
      let randomSensor : ISensor = this.allSensors![this.returnRandomNumberInRange(0, this.allSensors!.length - 1)];

      let randomStatus = this.returnRandomNumberInRange(13, 100);

      let newNotification : INotification = {
        status: randomStatus,
        dateTimeReceived: (new Date()).toISOString(),
        sensorId: randomSensor.id!
      };

      /*if (!this.isReportedStatusInExpectedInterval(randomSensor))
      {
        numberOfEmailsSent++;
        this.sendUnexpectedValueAlertEmail(randomSensor, numberOfEmailsSent);
      }*/

      let post = this.notificationsService.addNotification(newNotification);
      post.subscribe({
        next : addedNotification => {
          //newNotifications.push(addedNotification);
          //variant with refreshing right away each time a post request is completed
          this.displayedNotifications = this.displayedNotifications.concat(addedNotification);
          this.refreshTable();
        }      
        
      });
      requests.push(post);

      //randomSensor.currentStatus = randomStatus;
      //this.sensorsService.updateSensor(randomSensor).subscribe();
    }

    //works but is blocking the page
    /*let joinedRequests = forkJoin(requests);
    joinedRequests.subscribe({
      next: res =>
      {
        console.log("COMLETED");
        this.displayedNotifications = this.displayedNotifications.concat(newNotifications);
        this.refreshTable();
      }
    });*/
  }

  returnRandomNumberInRange(min : number, max : number)
  {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  isReportedStatusInExpectedInterval(addedSensor : ISensor)
  {
    return (addedSensor.currentStatus >= addedSensor.typeLowestValueExpected! && 
      addedSensor.currentStatus <= addedSensor.typeHighestValueExpected!);
  }

  async sendUnexpectedValueAlertEmail(addedSensor : ISensor, numberOfEmailsSent? : number)
  {
    let sender : string = environment.sender;
    let receiver : string = environment.receiver;
    let title : string = "Unexpected sensor value alert"

    let lowOrHighStatusMessage : string = (addedSensor.currentStatus < addedSensor.typeLowestValueExpected!) ? "low" : "high";

    let message : string = `A notification for sensor with serial number <strong>${addedSensor.id}</strong> was just added.<br> You received this alert because the notification reported an unexpected
      value of <strong>${addedSensor.currentStatus}</strong> for the sensor.<br> The expected range is <strong>${addedSensor.typeLowestValueExpected}-${addedSensor.typeHighestValueExpected}</strong>
      for this sensor type, which monitors the parameter <strong>${addedSensor.typeDescription}</strong>.<br> The current sensor value is <strong>too ${lowOrHighStatusMessage}</strong>.<br> Please check your plant :(`;

    this.emailServices.sendEmailSmtp(sender, receiver, title, message, numberOfEmailsSent);
  }

}
