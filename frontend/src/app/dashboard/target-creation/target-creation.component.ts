import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { TcServiceService } from '../../api-services/tc-service.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export interface TrgtData {
  target_id: string,
  target_type: string,
  subtype: string,
  policy: string,
  subscriber_id: string,
  network_id: number,
  active: string,
  start_time: number,
  end_time: number,
  assigned_to: string,


}

interface dropdown_field {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-target-creation',
  templateUrl: './target-creation.component.html',
  styleUrls: ['./target-creation.component.css']
})
export class TargetCreationComponent implements OnInit {

  username: string;
  user_role: string;
  formGroup: FormGroup;
  screen: string;
  target_id: string;
  message: string;
  operators: any;

  req_data: TrgtData;

  mobileQuery: MediaQueryList;
  voip: boolean;

  private _mobileQueryListener: () => void;

  displayedColumns: string[] = ['target_id', 'target_type', 'subtype', 'policy', 'active', 'start_time', 'end_time', 'assigned_to'];
  dataSource: MatTableDataSource<TrgtData>;

  sub_type_fields: dropdown_field[] = [];
  assigned_to_fields: dropdown_field[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  readData: any;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router, private location: Location, private exportService: ExportService, private service: TcServiceService) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.voip = false;
    this.screen = "";
    this.target_id = "";
    this.username = localStorage.getItem('username');
    this.user_role = localStorage.getItem('user_role');
    this.message = "";
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
  }
  ngOnInit(): void {
    this.getAllData();
    this.getDropdownValues();
    this.initForm();
  }
  //get key by given value of json

  getJSONKeyByValue(json_obj: any, value: string) {
    for (var key in json_obj) {
      if (json_obj[key] == value) {
        return key + "";
      }
    }
    return "";
  }

  onScreenChange() {
    this.clearForm();
    this.formGroup.value.subtype = "";
    console.log(this.formGroup.value)
    this.addColumnArray();
    if (this.screen == "Live Ipdr") {
      this.sub_type_fields = [
        {
          value: "",
          viewValue: "IP Address"
        }, {
          value: "",
          viewValue: "Subscriber ID"
        }
      ]

    } else if (this.screen == "Email Analysis") {
      this.sub_type_fields = [
        {
          value: "policy",
          viewValue: "Email ID"
        }, {
          value: "policy",
          viewValue: "Application"
        }
      ]
    } else if (this.screen == "Live Location Analysis") {
      this.sub_type_fields = [
        {
          value: "policy",
          viewValue: "IP Address"
        }, {
          value: "",
          viewValue: "Subscriber ID"
        }
      ]
    } else if (this.screen == "HTTP Analysis") {
      this.removeColumnArray();
    } else {
      this.sub_type_fields = [];
    }
  }
  num2dot(num) {
    var d = '' + num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = d + '.' + num % 256;
    }
    return d;
  }
  addColumnArray() {
    if (this.displayedColumns.indexOf('subtype') == -1) {
      this.displayedColumns.splice(1, 0, "subtype");
    }
  }

  removeColumnArray() {

    if (this.displayedColumns.indexOf('subtype') != -1) {
      this.displayedColumns.splice(1, 1);
    }
  }

  initForm() {
    this.formGroup = new FormGroup({
      start_time: new FormControl('', [Validators.required]),
      end_time: new FormControl('', [Validators.required]),
      subtype: new FormControl('', []),
      //    policy: new FormControl('', []),
      //      policy: new FormControl('', []),
      policy: new FormControl('', []),
      network_id: new FormControl('', []),
      subscriber_id: new FormControl('', []),
      assigned_to: new FormControl('', []),
      active: new FormControl('', []),
      //  policy: new FormControl('', [])
    });

    this.formGroup.patchValue({ start_time: this.subtractMinutes(1), end_time: new Date() });

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

  tableRowClick(row: any) {

    let form_data: any = {};
    this.target_id = "" + row.target_id;
    form_data.start_time = row.start_time;
    form_data.end_time = row.end_time;
    form_data.assigned_to = row.assigned_to;
    form_data.active = row.active;
    if (this.screen == "HTTP Analysis") {
      form_data.policy = row.policy;
    } else {
      form_data.subtype = row.subtype;
      if (row.subtype == "Email ID") {
        form_data.policy = row.policy;
      } else if (row.subtype == "Application") {
        form_data.policy = row.policy;
      } else if (row.subtype == "IP Address") {
        form_data.policy = row.policy;
      } else if (row.subtype == "Subscriber ID") {
        let policy_arr = row.policy.split("::");
        form_data.network_id = "" + this.getJSONKeyByValue(this.operators,policy_arr[0]);
        form_data.subscriber_id = policy_arr[1];
      }

    }

    this.formGroup.patchValue(form_data);
  }

  getAllData() {
    if (this.screen == "") {
      return;
    } else if (this.screen == "HTTP Analysis") {
      this.removeColumnArray();
    }
    this.service.getAllData(this.screen).subscribe((res) => {
      console.log(res);

      for (var x in res) {
        res[x].start_time = new Date(res[x].start_time * 1000);
        res[x].end_time = new Date(res[x].end_time * 1000);
        res[x].active = "" + res[x].active;
        if (res[x].subtype == 'IP Address') {
          res[x].policy = this.num2dot(res[x].policy);
        } else if (res[x].subtype == 'Subscriber ID') {
          let policy_arr = res[x].policy.split('::');
          let net_id = policy_arr[0];

          res[x].policy = this.operators[net_id] + "::" + policy_arr[1];
        }
      }

      this.readData = res;
      this.setTableData(res);
    });
  }


  dot2num(dot) {
    if (dot == null) {
      return 0
    }
    var d = dot.split('.');
    return ((((((+d[3]) * 256) + (+d[2])) * 256) + (+d[1])) * 256) + (+d[0]);
  }

  //this function is made to set request object of target data
  setTargetData() {
    let trgt_data: any = {};
    trgt_data.target_id = this.target_id;
    trgt_data.target_type = this.screen;
    trgt_data.active = this.formGroup.value.active;
    if (trgt_data.active == null) {
      trgt_data.active = 1;
    }
    trgt_data.start_time = (this.formGroup.value.start_time.getTime() - this.formGroup.value.start_time.getMilliseconds()) / 1000;
    trgt_data.end_time = (this.formGroup.value.end_time.getTime() - this.formGroup.value.end_time.getMilliseconds()) / 1000;
    trgt_data.assigned_to = this.formGroup.value.assigned_to;
    trgt_data.subtype = this.formGroup.value.subtype;

    if (trgt_data.subtype == null || trgt_data.subtype == "") {
      alert("Please Select Sub Type");
    }

    if (this.screen == "Live Ipdr" || this.screen == "Live Location Analysis") {
      if (trgt_data.subtype == "IP Address") {
        trgt_data.policy = this.dot2num(this.formGroup.value.policy);
        trgt_data.subscriber_id = undefined;
        trgt_data.network_id = undefined;
      } else if (trgt_data.subtype == "Subscriber ID") {
        if (this.formGroup.value.network_id == null || this.formGroup.value.subscriber_id == null || this.formGroup.value.subscriber_id == "") {
          alert("Please Enter Network/Customer Details.");
          return;
        }
        console.log(this.formGroup.value.subscriber_id);
        console.log(this.formGroup.value.network_id);
        // let net_name = this.getJSONKeyByValue(this.operators, this.formGroup.value.network_id);
        // console.log(net_name);

        trgt_data.policy = this.formGroup.value.network_id + "::" + this.formGroup.value.subscriber_id;
        trgt_data.subscriber_id = this.formGroup.value.subscriber_id;
        trgt_data.network_id = this.formGroup.value.network_id;
      }
    } else if (this.screen == "Email Analysis") {
      if (trgt_data.subtype == "Email ID") {
        trgt_data.policy = this.formGroup.value.policy;
        trgt_data.subscriber_id = undefined;
        trgt_data.network_id = undefined;
      } else if (trgt_data.subtype == "Application") {
        trgt_data.policy = this.formGroup.value.policy;
        trgt_data.subscriber_id = undefined;
        trgt_data.network_id = undefined;
      }
    } else if (this.screen == "HTTP Analysis") {
      trgt_data.policy = this.formGroup.value.policy;
      trgt_data.subscriber_id = undefined;
      trgt_data.network_id = undefined;
      trgt_data.subtype = undefined;
    } else {
    }

    return trgt_data;
  }

  addData() {
    if (this.formGroup.valid) {

      this.req_data = this.setTargetData();
      console.log(this.req_data);

      if (this.req_data == undefined) {
        return;
      }

      this.service.addData(this.req_data).subscribe((res) => {
        console.log(res);
        this.message = "Record Added successfully.";
        //alert(res);
        this.formGroup.reset();

        this.getAllData();
      }, error => {
        console.log(error.message);
        this.message = "Cannot Add Data, Try to contact developer!.";
        //alert("");
      });
    }

  }
  // assigned_to() {
  //   this.service.assigned_to().subscribe((res) => {
  //     console.log(res);
  //     for (var x in res) {
  //       console.log(res[x].user_username);
  //       this.assigned_to_fields.push(res[x].user_username);
  //     }
  //   });
  // }
  getDropdownValues() {
    this.service.getDropdownValues().subscribe((res) => {
      console.log(res);

      this.operators = res.operators;
      let usernames = res.usernames
      for (var x in usernames) {
        console.log(usernames[x].user_username);
        this.assigned_to_fields.push(usernames[x].user_username);
      }
      this.getAllData();
    });
  }

  addLocationAnalysisData() {
    let trgt_data: any = {};
    trgt_data.target_type = this.screen;
    trgt_data.active = this.formGroup.value.active;
    trgt_data.subtype = this.formGroup.value.subtype;
    trgt_data.policy = this.formGroup.value.policy;



    if (this.formGroup.valid) {

      console.log(trgt_data);

      this.service.addLocationAnalysisData(trgt_data.trgt_data).subscribe((res) => {
        console.log(res);
        // alert(res);
        this.message = "Loactaion Data Added.";
        this.formGroup.reset();

        this.getAllData();
      }, error => {
        console.log(error.message);
        this.message = "Cannot Add Location Data, Try to contact developer!.";
        //alert("Cannot Add Location Data, Try to contact developer!.");
      });
    }

  }



  updateData() {

    if (this.formGroup.valid && this.target_id != "") {
      this.req_data = this.setTargetData();
      console.log(this.req_data);
      this.service.updateData(this.req_data).subscribe((res) => {
        console.log(res);
        this.message = "Record Updated successfully.";
        // alert(res);
        this.formGroup.reset();
        this.target_id = "";
        this.getAllData();
      }, error => {
        console.log(error.message);
        this.message = "Cannot Add Data, Try to contact developer!.";
        //alert("Cannot Add Data, Try to contact developer!.");
      });
    }

  }

  deactivateData() {
    if (this.target_id != "") {
      var data = { target_id: this.target_id }
      this.service.deactivateData(data).subscribe((res) => {
        console.log(res);
        this.message = "Record Deactivated.";
        // alert(res);
        this.formGroup.reset();
        this.target_id = "";
        this.getAllData();
      }, error => {
        console.log(error.message);
        this.message = "Error";
        //alert("Cannot Add Data, Try to contact developer!.");
      });
    }

  }
  searchData() {
    let data = { ...this.formGroup.value };

    console.log(data);


    for (var x in data) {
      if (data[x] == null || data[x] == "null" || data[x] == '') {
        delete data[x];
      } else if (x == "start_time") {
        let time = this.formGroup.value.start_time.getTime();
        data.start_time = (time / 1000);
      } else if (x == "end_time") {
        data.end_time = (this.formGroup.value.end_time.getTime() / 1000);
      }
    }

    if (data.subtype == "IP Address") {
      data.policy = this.dot2num(data.policy);
    }

    data.type = this.screen;

    this.service.searchData(data).subscribe((res) => {

      for (var x in res) {
        res[x].start_time = new Date(res[x].start_time * 1000);
        res[x].end_time = new Date(res[x].end_time * 1000);
        res[x].active = "" + res[x].active;
        if (res[x].subtype == 'IP Address') {
          res[x].policy = this.num2dot(res[x].policy);
        }
      }
      this.readData = res;
      this.setTableData(res);
    }, error => {
      console.log(error.message);
      this.message = "Error";
      // alert("Cannot Add Data, Try to contact developer!.");
    });

  }

  clearForm() {
    this.formGroup.reset();
    this.formGroup.patchValue({ start_time: this.subtractMinutes(1), end_time: new Date() });
    this.target_id = "";
    this.getAllData();
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.router.navigate(['login']);
  }

}
