import { ChangeDetectorRef, Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { ApiserviceService } from '../../apiservice.service';
import { IpdrService } from '../../api-services/ipdr.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ipdrButtons } from './../../../environments/environment';

export interface IPDRData {
  Source_ip: string,
  Source_port: string,
  Destination_ip: string,
  Destination_port: string,
  protocol_l3: string,
  protocol_l4: string,
  Protocol_l7: string,
  Application: string,
  Category: string,
  calling_number: string,
  called_number: string,
  Packets_sent: string,
  Bytes_sent: string,
  Packets_received: string,
  Bytes_received: string,
  Start_time: string,
  End_time: string,
  operator_id: string,
  area_id: string,
  subscriber_id: string
}

export interface ReportsData {
  Index: number;
  Report_Name: string,
  Report_Query: string,
  Report_Interface: string,
  Report_Created_By: string,
  Has_Start_Time: number,
  Has_End_Time: number
}

export interface DateRange {
  from_time: number,
  to_time: number
}

interface side_field {
  value: string;
  viewValue: string;
}

interface customize_field {
  field: string;
  value: number;
}

@Component({
  selector: 'app-existing-reports',
  templateUrl: './existing-reports.component.html',
  styleUrls: ['./existing-reports.component.css']
})
export class ExistingReportsComponent implements AfterViewInit {

  ipdr_buttons = ipdrButtons;

  fields: side_field[] = [];

  reports_data: ReportsData[] = [];

  formGroup: FormGroup;
  report_name: string;
  mobileQuery: MediaQueryList;
  customize_criteria: boolean;

  l3: any;
  l4: any;
  l7: any;
  category: any;

  data: DateRange;

  range_start_time: any;
  range_end_time: any;

  selectedRecord: ReportsData;
  readData: any;

  private _mobileQueryListener: () => void;

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<IPDRData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private route: ActivatedRoute, private router: Router, private location: Location, private exportService: ExportService, private service: IpdrService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    //this.voip = false;

    this.formGroup = new FormGroup({
      field1: new FormControl('', [Validators.required]),
      value1: new FormControl('', [Validators.required]),
      field2: new FormControl('', [Validators.required]),
      value2: new FormControl('', [Validators.required]),
      field3: new FormControl('', [Validators.required]),
      value3: new FormControl('', [Validators.required]),
      field4: new FormControl('', [Validators.required]),
      value4: new FormControl('', [Validators.required])
    });
    this.report_name = "";
    this.l3 = {};
    this.l4 = {};
    this.l7 = {};
    this.category = {};

    let date_range = this.router.getCurrentNavigation().extras.state;
    if (date_range == undefined) {
      this.range_end_time = new Date();
      this.range_start_time = this.subtractMinutes(1);
    } else {
      this.range_end_time = date_range["end_time"];
      this.range_start_time = date_range["start_time"];
    }

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.sort = this.sort;
    this.getAllReports();
    this.getDropdownValues();
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  setTableData(results): void {

    this.dataSource = null;
    this.dataSource = new MatTableDataSource(results);
    //this.dataSource.paginator = this.paginator;
    //  this.dataSource.sort = this.sort;
  }

  btnAllIpdr(): void {
    //this.voip = false;
  }

  btnVoip(): void {
    //this.voip = true;
  }

  getAllReports() {
    this.service.getAllReports().subscribe((res) => {
      console.log(res);
      for (var x in res) {
        res[x].Index = x;
      }
      this.reports_data = res;
    });
  }

  onReportChange() {
    console.log(this.selectedRecord);
    this.generateReport();
  }
  getDropdownValues() {
    this.service.getDropdownValues().subscribe((res) => {
      this.category = res.categories;
      this.l7 = res.l7;
      this.l3 = res.l3;
      this.l4 = res.l4;
      console.log("dropdown......", this.l7);
    });
  }

  dot2num(dot) {
    var d = dot.split('.');
    return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
  }
  num2dot(num) {
    var d = '' + num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = d + '.' + num % 256;
    }
    return d;
  }

  generateReport() {
    this.setTableData([]);
    this.service.runReportQuery({ query: this.selectedRecord.Report_Query }).subscribe((res) => {
      if (res.length != 0) {
        this.displayedColumns = Object.keys(res[0]);
      }
      console.log("l3...", this.l3);
      for (var x in res) {
        if (res[x].Source_ip) {
          res[x].Source_ip = this.num2dot(res[x].Source_ip);
        }
        if (res[x].Destination_ip != undefined) {
          res[x].Destination_ip = this.num2dot(res[x].Destination_ip);
        }

        if (res[x].protocol_l3 != undefined) {
          //  console.log(this.l3);

          res[x].l3 = this.l3[res[x].protocol_l3];
        }
        if (res[x].protocol_l4 != undefined) {
          res[x].l4 = this.l4[res[x].protocol_l4];
          console.log(this.l7);

        }
        if (res[0].Protocol_l7 != undefined) {
          res[x].l7 = this.l7[res[x].Protocol_l7];
          console.log("l7...", res[0].l7)
        }
        if (res[x].Category != undefined) {
          console.log(this.category);
          res[x].category_name = this.category[res[x].Category];
        }
      }
      // res[0].ip_usage = res[0].Mb_sent / 1000000;
      console.log("resultsss", res.l7);
      this.setTableData(res);
      console.log("result...", res);
    });
  }

  logout() {
    this.router.navigate(['login']);
  }
}
