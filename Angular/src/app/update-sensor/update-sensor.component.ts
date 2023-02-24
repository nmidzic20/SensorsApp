import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { INotification } from '../shared/models/INotification';
import { ISensor } from '../shared/models/ISensor';
import { ISensorType } from '../shared/models/ISensorType';
import { EmailService } from '../shared/services/email.service';
import { NotificationsService } from '../shared/services/notifications.service';
import { SensorTypesService } from '../shared/services/sensor-types.service';
import { SensorsService } from '../shared/services/sensors.service';

@Component({
  selector: 'app-update-sensor',
  templateUrl: './update-sensor.component.html',
  styleUrls: ['./update-sensor.component.scss']
})
export class UpdateSensorComponent implements OnInit {

  updateMethod : boolean = true;
  title : string | undefined;
  
  sensor : ISensor | undefined;

  sensorTypes : ISensorType[] | undefined;
  selectedTypeId : number | undefined;

  id : number | null | undefined;
  currentStatus : number | undefined;
  initialValue : number | undefined;

  message = "";

  ngOnInit() 
  {
    this.showSensorTypes();
  
  }

  showSensorTypes()
  {
    //fill select box with sensor type options available
    this.sensorTypesService.getSensorTypes().subscribe({
      next: sensorTypes => {
        this.sensorTypes = sensorTypes;
        console.log(`getSensorTypes subscribe -> next notification: ` + JSON.stringify(this.sensorTypes));
      },
      error: err => {
        console.log(`getSensorTypes subscribe -> error notification ${err}`);
      },
      complete() {
        console.log(`getSensorTypes subscribe -> complete notification`);
      },
    });
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : any,
    private dialogRef: MatDialogRef<UpdateSensorComponent>,
    private sensorsService : SensorsService,
    private notificationsService: NotificationsService, 
    private sensorTypesService : SensorTypesService,
    private emailServices : EmailService)
  {
    console.log("Data " + JSON.stringify(data));

    this.updateMethod = (data.method == "Update");
    this.title = (this.updateMethod) ? `Update sensor ${data.sensor.id}` : `Add new sensor`;

    if (this.updateMethod)
      this.fillFields(data);
  }

  fillFields(data : any)
  {
    this.sensor = data.sensor;

    this.id = this.sensor!.id;
    this.currentStatus = this.sensor!.currentStatus;

    this.initialValue = this.sensor!.typeId;
    this.selectedTypeId = this.initialValue;
  }

  add()
  {
    let newSensor : ISensor = {
      currentStatus: this.currentStatus!,
      typeId: this.selectedTypeId!,

      //dummy values, they are not taken into account on backend as they can't be changed anyway
      //with null or undefined it threw errors on POST, optional/undefined also doesn't work since API requires typeDescription and Notifications fields
      //so idk what to do except this - EDIT: nvm, works without if in sensorModel in backend API those fields put as optional
      /*id: 0,
      typeDescription: "",
      typeLowestValueExpected: 0,
      typeHighestValueExpected: 0,
      notifications: []*/
    };

    let message = "";

    const get = this.sensorsService.addSensor(newSensor);
    get.subscribe({
      next: sensor => {
        console.log(`addSensor subscribe -> next notification: ` + JSON.stringify(sensor));
        message = "Sensor successfully added";

        let newNotification : INotification = {
          status: sensor!.currentStatus,
          dateTimeReceived: (new Date()).toISOString(),
          sensorId: sensor!.id!
        };
        this.addNotification(sensor, newNotification);
        this.closeDialog(message);
      },
      error: err => {
        console.log(`addSensor subscribe -> error notification`);
        message = `Error - sensor not added ${err}`;
      },
      
    });
    
  }

  addNotification(addedSensor : ISensor, newNotification : INotification)
  {
    /*let newNotification : INotification = {
      status: addedSensor!.currentStatus,
      dateTimeReceived: (new Date()).toISOString(),
      sensorId: addedSensor!.id!
    };*/
    this.notificationsService.addNotification(newNotification).subscribe({
      next : addedNotification => {

        if (!this.isReportedStatusInExpectedInterval(addedSensor))
        {
          this.sendUnexpectedValueAlertEmail(addedSensor);
        }
      },
      error: err => {
        console.log(`addNotification subscribe -> error notification`);
      }          
    });
  }

  isReportedStatusInExpectedInterval(addedSensor : ISensor)
  {
    return (addedSensor.currentStatus >= addedSensor.typeLowestValueExpected! && 
      addedSensor.currentStatus <= addedSensor.typeHighestValueExpected!);
  }

  update()
  {
    if (!this.validateInput()) 
      return;

    let updatedSensor : ISensor = this.sensor!;
    updatedSensor.currentStatus = this.currentStatus!;
    updatedSensor.typeId = this.selectedTypeId!;

    let message = "";
    this.sensorsService.updateSensor(updatedSensor).subscribe({
      next: sensor => {
        console.log(`updateSensor subscribe -> next notification: ` + JSON.stringify(sensor));
        message = "Sensor successfully updated";

        let newNotification : INotification = {
          status: sensor!.currentStatus,
          dateTimeReceived: (new Date()).toISOString(),
          sensorId: sensor!.id!
        };
        this.addNotification(sensor, newNotification);
        this.closeDialog(message);
      },
      error: err => {
        console.log(`updateSensor subscribe -> error notification`);
        message = `Error - sensor not updated. ${err}`;
      }
    });
    
  }

  closeDialog(message : string)
  {
    let eventType = (this.updateMethod) ? "Updated" : "Added";
    this.dialogRef.close({event: eventType, data: message});
  }

  selectType(val : number)
  {
    console.log(val);
    this.selectedTypeId = val; 
  }

  validateInput() : boolean
  {
    if (this.selectedTypeId == this.sensor!.typeId && 
      this.currentStatus == this.sensor!.currentStatus) 
    {
      this.message = "No new values entered";
      return false;
    }

    this.message = "";
    return true;
  }

  containsOnlyWhitespace(str : string)
  {
    return /^\s*$/.test(str);
  }

  sendUnexpectedValueAlertEmail(addedSensor : ISensor)
  {
    let sender : string = environment.sender;
    let receiver : string = environment.receiver;
    let title : string = "Unexpected sensor value alert"

    let lowOrHighStatusMessage : string = (addedSensor.currentStatus < addedSensor.typeLowestValueExpected!) ? "low" : "high";

    let message : string = `A notification for sensor with serial number <strong>${addedSensor.id}</strong> was just added.<br> You received this alert because the notification reported an unexpected
      value of <strong>${addedSensor.currentStatus}</strong> for the sensor.<br> The expected range is <strong>${addedSensor.typeLowestValueExpected}-${addedSensor.typeHighestValueExpected}</strong>
      for this sensor type, which monitors the parameter <strong>${addedSensor.typeDescription}</strong>.<br> The current sensor value is <strong>too ${lowOrHighStatusMessage}</strong>.<br> Please check your plant :(`;

    this.emailServices.sendEmailSmtp(sender, receiver, title, message);
  }
}
