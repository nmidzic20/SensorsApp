import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SensorTypesComponent } from './sensor-types/sensor-types.component';
import { SensorsComponent } from './sensors/sensors.component';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/sensors', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'sensors', component: SensorsComponent, canActivate: [AuthGuard]},
  { path: 'sensor-types', component: SensorTypesComponent, canActivate: [AuthGuard]},
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard]},
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
