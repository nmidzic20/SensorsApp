import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { INotification } from '../shared/models/INotification';
import { ISensor } from '../shared/models/ISensor';
import { EmailService } from '../shared/services/email.service';
import { NotificationsService } from '../shared/services/notifications.service';
import { SensorsService } from '../shared/services/sensors.service';
import { UpdateSensorComponent } from '../update-sensor/update-sensor.component';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss']
})
export class SensorsComponent implements OnInit {

  sensors: ISensor[] = [];

  initialSelection = [];
  allowMultiSelect = false;
  selection = new SelectionModel<ISensor>(this.allowMultiSelect, this.initialSelection);

  displayedColumns: string[] = ['id', 'currentStatus', 'typeDescription', 'interval', 'notifications', 'check', 'update', 'delete'];

  constructor(
    private router: Router, 
    private sensorsService: SensorsService, 
    private activatedRoute: ActivatedRoute,
    public dialog : MatDialog,
    private emailServices : EmailService,
    private snackbar : MatSnackBar) { }

  dataSource!: MatTableDataSource<ISensor>;

  @ViewChild('paginator') paginator!: MatPaginator;

  setDataSource() 
  {
    this.dataSource = new MatTableDataSource<ISensor>();
    this.dataSource.data = this.sensors;
    this.dataSource.paginator = this.paginator;
    //this.table.dataSource = dataSource;
  }

  ngOnInit()
  {
    this.getSensors();
  }

  getSensors()
  {
    this.sensorsService.getSensors().subscribe({
      next: sensors => {
        this.sensors = sensors;
        console.log(`getSensors subscribe -> next notification: ` + JSON.stringify(this.sensors));
        this.setDataSource();
      },
      error: err => {
        console.log(`getSensors subscribe -> error notification`);
      },
      complete() {
        console.log(`getSensors subscribe -> complete notification`);
      },
    });
  }

  onNotificationsClick(notifications : INotification[])
  {
    let notificationsFormatted : string = "";

    notifications.forEach( (notification, index) => {

      let dateTimeFormatted = new Date(Date.parse(notification.dateTimeReceived));

      notificationsFormatted += "<strong>Notification no. " + (index + 1) + "</strong><br>" 
        + "Status reported was: " + notification.status + "<br>" 
        + "Date and time reported: " + dateTimeFormatted + "<br><br>";

    });

    this.openMessageDialog(notificationsFormatted, "Notifications");
  }

  onAddClick()
  {
    let dialogRef = this.dialog.open(UpdateSensorComponent, { data: {"method": "Add"} });

    let message = "";

    dialogRef.afterClosed().subscribe(result => {

      if (result.event == 'Added')
      {
        this.getSensors();

        console.log(result.data);
        message = result.data;
        this.openMessageDialog(message, "Add sensor");

      }
    });
  }

  onUpdateClick(sensor : ISensor) 
  {
    let dialogRef = this.dialog.open(UpdateSensorComponent, { data: {"method": "Update", "sensor": sensor} });

    let message = "";

    dialogRef.afterClosed().subscribe(result => {

      if (result.event == 'Updated')
      {
        this.getSensors();

        console.log(result.data);
        message = result.data;
        this.openMessageDialog(message, "Update sensor");
      }
    });
  }

  onDeleteClick(sensorId: number) 
  {
    this.sensorsService.deleteSensor(sensorId)
      .subscribe(response => {
        this.sensors = this.sensors.filter(sensor => sensor.id !== sensorId);
        this.refreshTable();
      });
  }

  @ViewChild('table') table! : MatTable<ISensor>; 

  refreshTable()
  {
    //update table data source - creating a new datasource is necessary, do not put displayedNotifications directly into table.dataSource!
    let dataSource = new MatTableDataSource<ISensor>();
    dataSource.data = this.sensors;
    dataSource.paginator = this.paginator;
    this.table.dataSource = dataSource;
  }

  isUnexpectedValue(element : ISensor)
  {
    return element.currentStatus < element.typeLowestValueExpected! || element.currentStatus > element.typeHighestValueExpected! ? 'red' : '';
  }

  openMessageDialog(message : string, title : string)
  {
    this.dialog.open(MessageDialogComponent, { data: {"message": message, "title": title} });
  }

  onCheckClick(sensorId : number)
  {
    this.sensorsService.checkSensor(sensorId).subscribe(
      processInstanceId => {
        console.log(`Process instance ${processInstanceId} started`);
      }
    );
  }

}

