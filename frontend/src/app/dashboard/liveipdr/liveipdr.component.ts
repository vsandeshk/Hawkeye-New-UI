import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { IpdrLiveService } from '../../api-services/ipdr-live.service';
import { ActivityLogService } from '../../api-services/activity-log.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ipdrButtons } from './../../../environments/environment';

export interface IPDRData {
  Source_ip: string,
  Source_port: string,
  Destination_ip: string,
  Destination_port: string,
  protocol_l3: string,
  protocol_l4: string,
  Protocol_l7: string,
 // Application: string,
  Category: string,
  calling_number: string,
  called_number: string,
  Packets_sent: string,
  Bytes_sent: string,
  Packets_received: string,
  Bytes_received: string,
  Start_time: string,
  End_time: string,
  subscriber_id:string,
  operator_id: string,
  area_id: string,


}
@Component({
  selector: 'app-liveipdr',
  templateUrl: './liveipdr.component.html',
  styleUrls: ['./liveipdr.component.css']
})
export class LiveipdrComponent implements AfterViewInit {

  formGroup: FormGroup;
  searchFormGroup: FormGroup;

  ipdr_buttons = ipdrButtons;

  report_type: string;
  mobileQuery: MediaQueryList;
  customize_criteria: boolean;

  range_start_time: any;
  range_end_time: any;


  readData: any;

  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['Source_ip', 'Source_port', 'Destination_ip', 'Destination_port', 'protocol_l3', 'protocol_l4', 'Protocol_l7', 'Category', 'calling_number', 'called_number', 'Packets_sent', 'Bytes_sent', 'Packets_received', 'Bytes_received', 'Start_time', 'End_time', 'subscriber_id', 'operator_id', 'area_id'];
  dataSource: MatTableDataSource<IPDRData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private route: ActivatedRoute, private router: Router, private location: Location, private exportService: ExportService, private service: IpdrLiveService, private log_service: ActivityLogService, private dialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    //this.voip = false;

    this.formGroup = new FormGroup({
      field1: new FormControl('', []),
      value1: new FormControl('', []),
      field2: new FormControl('', []),
      value2: new FormControl('', []),
      field3: new FormControl('', []),
      value3: new FormControl('', []),
      field4: new FormControl('', []),
      value4: new FormControl('', [])
    });
    this.report_type = "";
    this.customize_criteria = (this.route.snapshot.paramMap.get('customized') === "true");
    if (this.customize_criteria) {
      this.report_type = "customized";
    }
    this.range_end_time = new Date();
    this.range_start_time = this.subtractMinutes(1);

    // Assign the data to the data source for the table to render

    this.dataSource = new MatTableDataSource();
    this.searchFormGroup =new FormGroup({
      keyword: new FormControl('', [Validators.required])

    });
  }


  ngAfterViewInit(): void {
    this.getData();
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  customizeCriteria() {
    this.customize_criteria = !this.customize_criteria;
    if (this.customize_criteria) {
      this.report_type = "customized";
    } else {
      this.formGroup.reset();
      this.report_type = "";
      this.getData();
    }
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

  liveSearch() {
    if (this.searchFormGroup.valid) {

      let data = { ...this.searchFormGroup.value };
      // for (var x in data) {
      //   data.from = (this.searchFormGroup.value.from) / 1000;
      //   data.to = (this.searchFormGroup.value.to) / 1000;
      // }
      console.log(data);
      console.log("searching data")


      this.service.searchByAnyKeywords(data).subscribe((res) => {

        for (var x in res) {
          res[x].Source_ip = this.num2dot(res[x].Source_ip);
          res[x].Destination_ip = this.num2dot(res[x].Destination_ip);
          // res[x].send_time = new Date(res[x].send_time * 1000);
        }
        this.readData = res;
        this.setTableData(res);
      }, error => {
        console.log(error.message);
        alert("Cannot Add Data, Try to contact developer!.");
      });
    }
  }

  getData() {
    this.formGroup.reset();
    this.service.getData().subscribe((res) => {
      for (var x in res) {
        res[x].Start_time = new Date(res[x].Start_time * 1000);
        res[x].End_time = new Date(res[x].End_time * 1000);
        res[x].Source_ip = this.num2dot(res[x].Source_ip);
        res[x].Destination_ip = this.num2dot(res[x].Destination_ip);
      }
      this.readData = res;
      this.setTableData(res);
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
  /*  if (this.formGroup.value.field2 != null && this.formGroup.value.field2 != "") {
      if (this.formGroup.value.field2 == "Source_ip" || this.formGroup.value.field2 == "Destination_ip") {
        value = this.dot2num(this.formGroup.value.value2);
      } else if (this.formGroup.value.field2 == "subscriber_id" || this.formGroup.value.field2 == "l3"  || this.formGroup.value.field2 == "l4" || this.formGroup.value.field2 == "l7") {
        value = this.formGroup.value.value2;
      } else {
        value = parseInt(this.formGroup.value.value2);
      }
      fields.push({
        field: this.formGroup.value.field2,
        value: value
      });
    }

    if (this.formGroup.value.field3 != null && this.formGroup.value.field3 != "") {
      if (this.formGroup.value.field3 == "Source_ip" || this.formGroup.value.field3 == "Destination_ip") {
        value = this.dot2num(this.formGroup.value.value3);
      } else if (this.formGroup.value.field3 == "subscriber_id" || this.formGroup.value.field3 == "l3"  || this.formGroup.value.field3 == "l4" || this.formGroup.value.field3 == "l7") {
        value = this.formGroup.value.value3;
      } else {
        value = parseInt(this.formGroup.value.value3);
      }
      fields.push({
        field: this.formGroup.value.field3,
        value: value
      });
    }

    if (this.formGroup.value.field4 != null && this.formGroup.value.field4 != "") {
      if (this.formGroup.value.field4 == "Source_ip" || this.formGroup.value.field4 == "Destination_ip") {
        value = this.dot2num(this.formGroup.value.value4);
      } else if (this.formGroup.value.field4 == "subscriber_id" || this.formGroup.value.field4 == "l3"  || this.formGroup.value.field4 == "l4" || this.formGroup.value.field4 == "l7") {
        value = this.formGroup.value.value4;
      } else {
        value = parseInt(this.formGroup.value.value4);
      }
      fields.push({
        field: this.formGroup.value.field4,
        value: value
      });
    }
*/


  // getAllDataByRange() {

  //   this.data = {
  //     from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
  //     to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000
  //   }

  //   this.service.getAllDataByRange(this.data).subscribe((res) => {
  //     for (var x in res) {
  //       res[x].Start_time = new Date(res[x].Start_time * 1000);
  //       res[x].End_time = new Date(res[x].End_time * 1000);
  //       res[x].Source_ip = this.num2dot(res[x].Source_ip);
  //       res[x].Destination_ip = this.num2dot(res[x].Destination_ip);
  //     }
  //     this.readData = res;
  //     this.setTableData(res);
  //   });
  // }
  clearForm() {
    this.searchFormGroup.reset();
  }

  goBack() {
    this.location.back();
  }

  logout() {

    this.log_service.addLog({action:"Logout"}).subscribe((res)=>{
      console.log(res);
    });
    this.router.navigate(['login']);
  }

}
