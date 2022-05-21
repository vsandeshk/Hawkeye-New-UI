import { ChangeDetectorRef, Component, AfterViewInit, ViewChild, ElementRef, ApplicationInitStatus } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { ApiserviceService } from '../../apiservice.service';
import { IpdrService } from '../../api-services/ipdr.service';
import { Chart } from 'chart.js';
import { ipdrButtons } from './../../../environments/environment';



export interface DateRange {
  start_time: number,
  end_time: number
}
@Component({
  selector: 'app-bandwidth-bar-chart',
  templateUrl: './bandwidth-bar-chart.component.html',
  styleUrls: ['./bandwidth-bar-chart.component.css']
})
export class BandwidthBarChartComponent implements AfterViewInit {
  xValues: string[] = [];
  yValues: number[] = [];
  mobileQuery: MediaQueryList;
  voip: boolean;

  data: DateRange;

  range_start_time: any;
  range_end_time: any

  readData: any;

  ipdr_buttons = ipdrButtons;

  private _mobileQueryListener: () => void;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: IpdrService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    let date_range = this.router.getCurrentNavigation().extras.state;
    if (date_range == undefined) {
      this.range_end_time = new Date();
      this.range_start_time = this.subtractMinutes(1);
    } else {
      this.range_end_time = date_range["end_time"];
      this.range_start_time = date_range["start_time"];
    }

    // Assign the data to the data source for the table to render
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  setChart() {
    var barColors = "#0094e1";
    new Chart("myChart", {
      type: "bar",
      data: {
        labels: this.xValues,
        datasets: [{
          label: "Bandwidth",
          backgroundColor: barColors,
          data: this.yValues,
        }]
      },
      options: {
        legend: {
          labels: {
            fontStyle: 'bold',
            fontColor: 'White',
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              fontStyle: 'bold',
              fontColor: 'White',
              display: true,
              labelString: 'Data Rate (Bps) '
            }
          }],
          xAxes: [{
            scaleLabel: {
              fontStyle: 'bold',
              fontColor: 'White',
              display: true,
              labelString: 'Application'
            }
          }]
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.getAllData();
  }

  btnAllIpdr(): void {
    this.voip = false;
  }

  btnVoip(): void {
    this.voip = true;
  }

  getAllData() {
    let data: any = {
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
    }

    this.service.getBarChartData(data).subscribe((res) => {
      this.xValues = [];
      this.yValues = [];
      let aggregate = 0.00;
      for (var x in res) {
        aggregate = parseFloat(res[x].aggregate);
        this.xValues.push(res[x].app_name);

        this.yValues.push(aggregate);
      }
      console.log(this.xValues);
      console.log(this.yValues);
      this.setChart();

    });
  }

  num2dot(num) {
    var d = '' + num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = d + '.' + num % 256;
    }
    return d;
  }
  goBack() {
    this.location.back();
  }

  logout() {
    this.router.navigate(['login']);
  }

}
