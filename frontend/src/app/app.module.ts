import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material.module';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { IPDRComponent, DialogSaveReport } from './dashboard/ipdr/ipdr.component';
import { BandwidthBarChartComponent } from './ipdr/bandwidth-bar-chart/bandwidth-bar-chart.component';
import { ExistingReportsComponent } from './ipdr/existing-reports/existing-reports.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { TargetCreationComponent } from './dashboard/target-creation/target-creation.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiserviceService } from './apiservice.service';
import { ExportService } from './export.service';
import { HttpComponent } from './dashboard/http/http.component';
import { DnsComponent } from './dashboard/dns/dns.component';
import { EmailComponent, PopupWindow } from './dashboard/email/email.component';
import { LiveipdrComponent } from './dashboard/liveipdr/liveipdr.component';
import { ActivityComponent } from './dashboard/activity/activity.component';
import { LocationComponent } from './dashboard/location/location.component';
import { PolicyComponent } from './dashboard/policy/policy.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    IPDRComponent,
    DialogSaveReport,
    ExistingReportsComponent,
    BandwidthBarChartComponent,
    TargetCreationComponent,
    HttpComponent,
    DnsComponent,
    EmailComponent,
    LiveipdrComponent,
    ActivityComponent,
    LocationComponent,
    PolicyComponent,
    PopupWindow
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    HttpClientModule,
    NgxChartsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCebwztMcICqVOvGRnx-E0z9slSvj8pBmY',
    }),
  ],
  providers: [ApiserviceService, ExportService],
  bootstrap: [AppComponent]
})
export class AppModule { }
