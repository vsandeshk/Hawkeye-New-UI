import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { LocationService } from '../../api-services/location.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { AgmCoreModule } from '@agm/core';

export interface tableData {
  public_ip: string,
  private_ip: string,
  network_id:string,
  customer_id: string,

}
export interface DateRange {
  from_time: number,
  to_time: number
}
export interface MapCords {
  lat: number,
  long : number
}


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {

  analysis_type: string;

  formGroup: FormGroup;
  mobileQuery: MediaQueryList;

  topFormGroup: FormGroup;
  data: DateRange;
  search_bar: string;
  range_start_time: any;
  range_end_time: any;
  voip: boolean;
  // map integrate
  cords:MapCords;

  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['public_ip','private_ip','network_id', 'customer_id'];
  dataSource: MatTableDataSource<tableData>;

  @ViewChild('locationTable')
  locationTable!: ElementRef;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readData: any;
  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: LocationService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    this.analysis_type = "Location Analysis";
    this.cords = {lat: 0, long: 0}
    // Create 100 users

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }
  ngOnInit(): void {

    this.getAllData();
    this.initForm();
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  onScreenChange():void {
    switch(this.analysis_type) {
      case "Email":
      this.router.navigate(['email']);
      break;
      case "HTTP":
      this.router.navigate(['http']);
      break;
      case "DNS":
      this.router.navigate(['dns']);
      break;
      default:
      break;
    }
  }

  initForm() {
    this.formGroup = new FormGroup({
      network_id: new FormControl('', [Validators.required]),
      customer_id: new FormControl('', [Validators.required]),
      public_ip: new FormControl('', [Validators.required]),
      private_ip: new FormControl('', [Validators.required]),

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

  exportElmToExcel(): void {
    this.exportService.exportTableElmToExcel(this.locationTable, 'location_data');
  }

  getAllData() {
    this.service.getAllData().subscribe((res) => {
      console.log(res);
       for (var x in res) {
         res[x].public_ip = this.num2dot(res[x].public_ip);
       }
       if (res.length != 0) {
         this.setMapCords(res[0].public_ip);
       }
      this.readData = res;
      this.setTableData(res);
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
  setMapCords(ip_address:string){
    this.service.getIPDetails(ip_address).subscribe((res) => {
      console.log(res);

      this.cords.lat = res.lat;
      this.cords.long =  res.lon;
      console.log(this.cords)
      // this.readData = res;

      // this.setTableData(res);
    });
  }


  searchData() {
    let data = { ...this.formGroup.value };
    for (var x in data) {
      if (data[x] == null || data[x] == '') {
        delete data[x];
      } else if (x == "last_accessed") {
        data.last_accessed = (this.formGroup.value.last_accessed) / 1000;
      }
    }

    this.service.searchData(data).subscribe((res) => {

      for (var x in res) {
        res[x].last_accessed = new Date(res[x].last_accessed * 1000);
      }
      this.readData = res;
      this.setTableData(res);
    }, error => {
      console.log(error.message);
      alert("Cannot Add Data, Try to contact developer!.");
    });
  }

  topBarsearch() {
    if (this.topFormGroup.valid) {

      let data = { ...this.topFormGroup.value };
      this.service.searchByAnyKeyword(data).subscribe((res) => {
        for (var x in res) {
          res[x].public_ip = this.num2dot(res[x].public_ip);
        }
        if (res.length != 0) {
          this.setMapCords(res[0].public_ip);
        }
        this.readData = res;
        this.setTableData(res);
      }, error => {
        console.log(error.message);
        alert("Cannot Add Data, Try to contact developer!.");
      });
    }
  }
  tableRowClick(row: any) {
    console.log(row);
    console.log(this.formGroup.value);
    //delete row.blocked;
    this.formGroup.setValue(row);
    this.setMapCords(row.public_ip);
    //    this.formGroup.patchValue({active_s: this.formGroup.value.active});
  }
  fetchMarkerInfo(){
    alert("longitude"+this.cords.long+"latitude"+this.cords.lat)
    }
  clearForm() {
    this.formGroup.reset();
    this.topFormGroup.reset();
    this.getAllData();
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.router.navigate(['login']);
  }
}
