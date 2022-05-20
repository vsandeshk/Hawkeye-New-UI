import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard/dashboard.component";
import { IPDRComponent } from "./dashboard/ipdr/ipdr.component";
import { TargetCreationComponent } from './dashboard/target-creation/target-creation.component';
import { HttpComponent } from './dashboard/http/http.component';
import { DnsComponent } from './dashboard/dns/dns.component';
import { EmailComponent } from './dashboard/email/email.component';
import { LiveipdrComponent } from './dashboard/liveipdr/liveipdr.component';
import { ActivityComponent } from './dashboard/activity/activity.component';
import { LocationComponent } from './dashboard/location/location.component';
import { PolicyComponent } from './dashboard/policy/policy.component';
import { BandwidthBarChartComponent } from './ipdr/bandwidth-bar-chart/bandwidth-bar-chart.component';
import { ExistingReportsComponent } from './ipdr/existing-reports/existing-reports.component';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: 'login'
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'dashboard', component: DashboardComponent
  },
  {
    path: 'target-creation', component:TargetCreationComponent
  },
  {
    path: 'http', component: HttpComponent
  },
  {
    path: 'dns', component: DnsComponent
  },
  {
    path: 'email', component: EmailComponent
  },
  {
    path: 'liveipdr', component: LiveipdrComponent
  },
  {
    path: 'activity', component: ActivityComponent
  },
  {
    path: 'location', component: LocationComponent
  },
  {
    path: 'policy', component: PolicyComponent
  },
  {
    path: 'ipdr', component: IPDRComponent
  },
  {
    path: 'ipdr/reports', component: ExistingReportsComponent
  },
  {
    path: 'ipdr/bandwidth-bar-chart', component: BandwidthBarChartComponent
  },
];
// UnclassifiedTrafficComponent
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
