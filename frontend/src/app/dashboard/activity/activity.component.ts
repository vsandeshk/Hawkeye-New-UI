import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { ActivityLogService } from '../../api-services/activity-log.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export interface tableData {
  username: string,
  user_role: string,
  action: string,
  time: string
}


@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  formGroup: FormGroup;
  selectedRow: tableData;

  mobileQuery: MediaQueryList;
  voip: boolean;


  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['username', 'user_role', 'action', 'time'];
  dataSource: MatTableDataSource<tableData>;
  username:string[]=[];
  
  @ViewChild('activityTable')
  activityTable!: ElementRef;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readData: any;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: ActivityLogService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }
  ngOnInit(): void {
    this.getusername();
    this.getAllData();
    this.initForm();
  }

  initForm() {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      start_time: new FormControl('', [Validators.required]),
      end_time: new FormControl('', [Validators.required]),
      action: new FormControl('', [Validators.required])
    });
  }

  setTableData(results): void {
    this.dataSource = null;
    this.dataSource = new MatTableDataSource(results);
    //this.dataSource.paginator = this.paginator;
    //  this.dataSource.sort = this.sort;
  }
tableRowClick(row: any) {
    console.log(row);
    console.log(this.formGroup.value);
    //this.formGroup.setValue(row);
    this.formGroup.patchValue({ username: row.username, action:row.action, start_time: row.time});
    // console.log(row);
    // console.log(this.formGroup.value);
    // this.selectedRow = row;

    // this.formGroup.setValue(row);
    //patch value use for specific values priting
    // this.formGroup.patchValue({ username: row.username, action:row.action });
  }

  exportElmToExcel(): void {
    this.exportService.exportTableElmToExcel(this.activityTable, 'activity_data');
  }

  getAllData() {
    this.service.getAllData().subscribe((res) => {
      this.readData = res;
      this.setTableData(res);
    });
  }
  getusername(){
    this.service.getusername().subscribe((res) => {
      console.log(res);
      for(var x in res)
      {
       console.log(res[x].user_username);
      this.username.push(res[x].user_username);
      }
  });
  }

  searchData(){
    let data = {...this.formGroup.value};

    console.log(this.formGroup.value);
    // for (var x in data) {
    //   if (data[x] == null || data[x] == '') {
    //     delete data[x];
    //   } else if (x == "start_time") {
    //     let time = this.formGroup.value.start_time.getTime();
    //     data.start_time = (time/1000);
    //   } else if (x == "end_time") {
    //     data.end_time = (this.formGroup.value.end_time.getTime()/1000);
    //   }
    // }
    this.service.searchData(data).subscribe((res) => {

      this.readData = res;
      this.setTableData(res);
    }, error => {
      console.log(error.message);
      alert("Cannot Search Data, Try to contact developer!.");
    });
  }
  
  clearForm() {
    this.formGroup.reset();
    this.getAllData();
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.router.navigate(['login']);
  }

}
