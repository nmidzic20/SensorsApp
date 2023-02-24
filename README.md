# SensorsApplication
The final version of the application created during the two weeks of GDi Winter Workshop

## Deployment

To enable sensor checking process by clicking the sensor check icon:
Start Camunda server (double-clicking start.bat for Windows or start.sh for Linux/Mac), then from the directory ExternalTaskWorker start the script with `node ExternalTaskWorker.js`.

Backend to provide data using DBMS SQL Server:
Start the solution in ASP.NET from Visual Studio.
(The project requires .NET 7 support.)

Necessary to add your own DB using commands for Migrations.

Frontend:
From the directory Angular run `ng serve`.
Go to localhost:4200/

Using mail: in Angular/src/app/shared/services/email.service.ts enter your own username and password for the email service you are using (replace Host if not using Elastic Email service).

