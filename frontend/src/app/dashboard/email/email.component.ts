import { Component, OnInit, Inject } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { EmailService } from '../../api-services/email.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface tableData {
  uuid: string,
  mailfrom: string,
  mailto: string,
  subject: string,
  filename: string,
  sip: string,
  sport: string,
  dip: string,
  dport: string,
  body: string,

}
export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})


export class EmailComponent implements OnInit {

  selectedRow: tableData;

  formGroup: FormGroup;
  screen: string;

  mobileQuery: MediaQueryList;
  voip: boolean;
  topFormGroup: FormGroup;


  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['uuid', 'mailfrom', 'mailto', 'subject', 'filename', 'sip', 'sport', 'dip', 'dport'];
  dataSource: MatTableDataSource<tableData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('getFile') browse_btn: ElementRef;

  readData: any;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: EmailService, public dialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    this.screen = "Email";

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


  initForm() {
    this.formGroup = new FormGroup({
      mailfrom: new FormControl('', [Validators.required]),
      mailto: new FormControl('', [Validators.required]),
      // send_time: new FormControl('', [Validators.required]),
      // cc: new FormControl('', []),
      // bcc: new FormControl('', []),
      subject: new FormControl('', []),
      // message: new FormControl('', []),
      file: new FormControl('', [])
    });

    this.topFormGroup = new FormGroup({
      from: new FormControl('', [Validators.required]),
      keyword: new FormControl('', [Validators.required]),
      to: new FormControl('', [Validators.required])
    });
    this.topFormGroup.patchValue({
      to: new Date(),
      from: this.subtractMinutes(1),
    })
    // this.topFormGroup.value.to = new Date();
    // this.topFormGroup.value.from = this.subtractMinutes(1);
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
    this.selectedRow = row;

    // this.formGroup.setValue(row);
    //patch value use for specific values priting
    this.formGroup.patchValue({ mailfrom: row.mailfrom, mailto: row.mailto, subject: row.subject });
  }
  topSearch() {
    if (this.topFormGroup.valid) {

      let data = { ...this.topFormGroup.value };
      for (var x in data) {
        data.from = (this.topFormGroup.value.from) / 1000;
        data.to = (this.topFormGroup.value.to) / 1000;
      }
      console.log(data);


      this.service.searchByAnyKeywords(data).subscribe((res) => {

        for (var x in res) {
          res[x].sip = this.num2dot(res[x].sip);
          res[x].dip = this.num2dot(res[x].dip);
          // res[x].send_time = new Date(res[x].send_time * 1000);
        }
        this.readData = res;
        this.setTableData(res);
      }, error => {
        console.log(error.message);
        alert("Cannot Search, Try to contact developer!.");
      });
    }
  }

  getAllData() {
    this.service.getAllData().subscribe((res) => {
      console.log(res, "res==>");
      for (var x in res) {
        res[x].sip = this.num2dot(res[x].sip);
        res[x].dip = this.num2dot(res[x].dip);
        // res[x].send_time = new Date(res[x].send_time * 1000);
      }
      this.readData = res;
      this.setTableData(res);
    });
  }

  num2dot(num) {
    var d = '' + num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      // d = num % 256 + '.' + d;
      d = d+ '.' + num % 256 ;
    }
    return d;
  }
  // search data component isn't working properly
  // bad request issue
  searchData() {
    let data = { ...this.formGroup.value };
    for (var x in data) {
      if (data[x] == null || data[x] == '') {
        delete data[x];
      }
      // } else if (x == "send_time") {
      //   data.send_time = (this.formGroup.value.send_time) / 1000;
      // }
    }

    this.service.searchData(data).subscribe((res) => {
      for (var x in res) {
        res[x].sip = this.num2dot(res[x].sip);
        res[x].dip = this.num2dot(res[x].dip);
        // res[x].send_time = new Date(res[x].send_time * 1000);
      }
      this.readData = res;
      this.setTableData(res);
    }, error => {
      console.log(error.message);
      alert("Cannot Add Data, Try to contact developer!.");
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

  openDialog(): void {
    const dialogRef = this.dialog.open(PopupWindow, {
      width: '700px',
      height: '550px',
      data: this.selectedRow,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }
}

@Component({
  selector: 'popup-window',
  templateUrl: 'popup-window.html',
  styleUrls: ['./popup-window.css']
})
export class PopupWindow {
  constructor(
    public dialogRef: MatDialogRef<PopupWindow>,
    @Inject(MAT_DIALOG_DATA) public data: tableData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
