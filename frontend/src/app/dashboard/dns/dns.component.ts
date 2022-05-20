import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { DnsService } from '../../api-services/dns.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Chart } from 'chart.js';

export interface tableData {
  url: string,
  access_count: string,
  last_accessed: string,
  category1: string,
  category2: string,
  category3: string,
}

interface AccessCount {
  url: string;
  access_count: string;
}

// interface CategoryData {
//   value: string;
//   viewValue: string;
// }

// interface dropdown_field {
//   value: string;
//   viewValue: string;
// }
export interface DateRange {
  from_time: number,
  to_time: number
}

@Component({
  selector: 'app-dns',
  templateUrl: './dns.component.html',
  styleUrls: ['./dns.component.css']
})
export class DnsComponent implements OnInit {
  ///// bar strt////
  chart_values: AccessCount[];
  search_bar: string;
  view: any[string] = [700, 400];

  formGroup: FormGroup;
  topFormGroup: FormGroup;

  screen: string;

  mobileQuery: MediaQueryList;
  data: DateRange;

  range_start_time: any;
  range_end_time: any;

  voip: boolean;

  categories: any;

  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['url', 'access_count', 'last_accessed', 'category1', 'category2', 'category3'];
  dataSource: MatTableDataSource<tableData>;

  category_name: string[] = [];
  xValues: string[] = [];
  yValues: number[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readData: any;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: DnsService) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    this.screen = "dns";
    this.categories = {};

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }
  ngOnInit(): void {

    this.getAllData();
    this.initForm();
    this.getAccessCount();
    this.getCategories();
  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  initForm() {
    this.formGroup = new FormGroup({
      url: new FormControl('', []),
      access_count: new FormControl('', []),
      last_accessed: new FormControl('', [Validators.required]),
      category1: new FormControl('', []),
      category2: new FormControl('', []),
      category3: new FormControl('', []),
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

  getAllData() {
    this.service.getAllData().subscribe((res) => {

      for (var x in res) {
        res[x].last_accessed = new Date(res[x].last_accessed * 1000);
        res[x].category1 += "";
        res[x].category2 += "";
        res[x].category3 += "";
      }
      this.readData = res;
      this.setTableData(res);
      console.log(res);

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
        res[x].category1 += "";
        res[x].category2 += "";
        res[x].category3 += "";
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
      for (var x in data) {
        data.from = (this.topFormGroup.value.from) / 1000;
        data.to = (this.topFormGroup.value.to) / 1000;
      }
      this.service.searchByAnyKeyword(data).subscribe((res) => {

        for (var x in res) {
          res[x].last_accessed = new Date(res[x].last_accessed * 1000);          
          res[x].category1 += "";
          res[x].category2 += "";
          res[x].category3 += "";
        }
        this.readData = res;
        this.setTableData(res);
      }, error => {
        console.log(error.message);
        alert("Cannot Add Data, Try to contact developer!.");
      });
    }
  }

  getCategories() {
    this.service.getCategories().subscribe((res) => {
      this.categories = res;
      console.log(res);

    });
  }
  clearForm() {
    this.formGroup.reset();
    this.topFormGroup.reset();
    this.topFormGroup.patchValue({
      to: new Date(),
      from : this.subtractMinutes(1),
    })
    this.getAllData();
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.router.navigate(['login']);
  }

  getAccessCount() {
    this.service.getAccessCount().subscribe((res) => {
      this.chart_values = res;
      console.log(this.chart_values);
      let value = 0;
      for (var x in res) {
        value = parseInt(res[x].value);
        this.xValues.push(res[x].name);
        this.yValues.push(value);
      }
      this.setChart();
    }, error => {
      console.log(error.message);
      alert("Cannot Add Data, Try to contact developer!.");
    });
  }

  setChart() {
    new Chart("myChart", {
      type: "pie",
      data: {
        labels: this.xValues,
        datasets: [{
          label: "",
          backgroundColor: ["#56e2cf", "#56aee2", "#5668e2", "#8a56e2", "#cf56e2", "#e256ae", "#e25668", "#e28956", "#e2cf56", "#aee256", "#68e256", "#56e289"],
          data: this.yValues,
        }]
      },
      options: {
        legend:{
          position:'left',
          labels:{
            fontStyle:'bold',
            fontColor:'Black',
        }}
      }
    });
  }

  tableRowClick(row: any) {
    console.log(row);
    console.log(this.formGroup.value);
    delete row.blocked;
    delete row.source_type;
    this.formGroup.setValue(row);
    //    this.formGroup.patchValue({active_s: this.formGroup.value.active});
  }
  ///bar//
  // onSelect(event: any) {
  //   console.log(event);
  // }
  //
  // onActivate(data: any): void {
  //   console.log('Activate', JSON.parse(JSON.stringify(data)));
  // }
  //
  // onDeactivate(data: any): void {
  //   console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  // }

  formatString(input: string): string {
    return input.toUpperCase()
  }
  //
  formatNumber(input: number): number {
    return input
  }
  ///bar end///

}
