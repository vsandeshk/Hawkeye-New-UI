import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { HttpAnalysisService } from '../../api-services/http-analysis.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface TrgtData {
  url: string,
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
  Start_time: string,
  End_time: string
  operator_id:string,
  area_id:string,
  subscriber_id:string,

}
export interface DateRange {
  from_time: number,
  to_time: number
}

@Component({
  selector: 'app-http',
  templateUrl: './http.component.html',
  styleUrls: ['./http.component.css']
})
export class HttpComponent implements OnInit {

  formGroup: FormGroup;
  analysis_type: string;

  mobileQuery: MediaQueryList;
  data: DateRange;

  range_start_time: any;
  range_end_time: any;

  voip: boolean;
  onclick_url_detail: any;
  topFormGroup: FormGroup;


  private _mobileQueryListener: () => void;


  displayedColumns: string[] = ['url', 'Source_ip', 'Source_port', 'Destination_ip', 'Destination_port', 'protocol_l3', 'protocol_l4', 'Protocol_l7', 'Category', 'Start_time', 'End_time','operator_id','subscriber_id'];
  dataSource: MatTableDataSource<TrgtData>;



  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readData: any;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: HttpAnalysisService, private sanitizer: DomSanitizer) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    this.analysis_type = "HTTP";
    //this.onclick_url_detail= this.sanitizer.bypassSecurityTrustUrl("www.google.com");
    this.onclick_url_detail = "https://www.google.com/";// "https://www.wikipedia.org/";



    // Create 100 users

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }
  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(oldURL);
  }
  ngOnInit(): void {

    this.getAllData();
    this.initForm();
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  initForm() {
    this.formGroup = new FormGroup({
      source_ip: new FormControl('', []),
      user_agent: new FormControl('', []),
      data: new FormControl('', []),
      attachment: new FormControl('', []),
      url: new FormControl('', []),
      destination_ip: new FormControl('', []),
      http_command: new FormControl('', []),
      username: new FormControl('', []),
      password: new FormControl('', []),
      session_id: new FormControl('', []),
      longitude: new FormControl('', [Validators.required]),
      latitude: new FormControl('', [Validators.required]),
      customer_id: new FormControl('', [Validators.required]),
      device_id: new FormControl('', [])

    });
    this.topFormGroup = new FormGroup({
      from: new FormControl('', [Validators.required]),
      keyword: new FormControl('', [Validators.required]),
      to: new FormControl('', [Validators.required])
    });
    this.topFormGroup.patchValue({
      to: new Date(),
      from : this.subtractMinutes(1),
    })
  }

  setTableData(results): void {
    this.dataSource = null;
    this.dataSource = new MatTableDataSource(results);
    //this.dataSource.paginator = this.paginator;
    //  this.dataSource.sort = this.sort;
  }

  tableRowClick(row: any) {
    console.log(row);

    //this.formGroup.setValue(row);
    console.log("test");

    this.onclick_url_detail = row.url;

    //    this.formGroup.patchValue({active_s: this.formGroup.value.active});
  }
  topBarsearch() {
    if (this.topFormGroup.valid) {

      let data = { ...this.topFormGroup.value };
      for (var x in data) {
        data.from = (this.topFormGroup.value.from) / 1000;
        data.to = (this.topFormGroup.value.to) / 1000;
      }
      console.log(data);


      this.service.searchByAnyKeyword(data).subscribe((res) => {

        for (var x in res) {
          res[x].Start_time = new Date(res[x].Start_time * 1000);
          res[x].End_time = new Date(res[x].End_time * 1000);
          res[x].Source_ip = this.num2dot(res[x].Source_ip);
          res[x].Destination_ip = this.num2dot(res[x].Destination_ip);
        }
        this.readData = res;
        this.setTableData(res);
      }, error => {
        console.log(error.message);
        alert("Cannot Add Data, Try to contact developer!.");
      });
    }
  }
  clearForm() {
    this.formGroup.reset();
    this.topFormGroup.reset();
    this.getAllData();
  }

  getAllData() {
    this.service.getAllData().subscribe((res) => {
      console.log(res, "res==>");
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

  num2dot(num) {
    console.log(num);

    var d = '' + num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      // d = num % 256 + '.' + d;
      d = d+ '.' + num % 256 ;
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
