import { ChangeDetectorRef, Component, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { PolicyService } from '../../api-services/policy.service';
import { ActivityLogService } from '../../api-services/activity-log.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ipdrButtons } from './../../../environments/environment';


export interface PolicyData {
  source_id: number,
  name: string,
  type: string,
  bytes_sent: number,
  bytes_rcvd: number,
  packets_sent: number,
  packets_rcvd: number,
  start_time: string,
  end_time: string,
  finish_time: string,
  violation: string,
  description: string,
  sessions_to_skip: string,
  active: string,
  inserted: string,
  throttle: string,
  policy_category: string

}

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements AfterViewInit {


  mobileQuery: MediaQueryList;
  formGroup: FormGroup;
  readData: any;
  btn_select_policy: boolean;
  btn_existing_policy: boolean;
  btn_add_new_policy: boolean;
  policy_type: string;
  rule_values: any; //for dropdowns
  categories: any; //for all categories
  applications: any; //for all applications/l7
  l3: any; //for all L3
  l4: any; //for all L4
  throttle: any;
  select_policy: string;
  select_existing_policy: string;
  existing_policies: string[] = [];
  selectedRecord: number;
  // deactivate types
  name: string;
  type: any;
  start_time: any;
  message: string;
  private _mobileQueryListener: () => void;

  defaultColumns: string[] = ['name', 'type', 'bytes_sent', 'bytes_rcvd', 'packets_sent', 'packets_rcvd', 'start_time', 'end_time', 'violation', 'description', 'sessions_to_skip', 'active', 'inserted', 'throttle'];
  displayedColumns: string[] = ['name', 'type', 'bytes_sent', 'bytes_rcvd', 'packets_sent', 'packets_rcvd', 'start_time', 'end_time', 'violation', 'description', 'sessions_to_skip', 'active', 'inserted', 'throttle'];
  displayedCategoryColumns: string[] = ['url', 'access_count', 'last_accessed', 'category1', 'category2', 'category3'];
  dataSource: MatTableDataSource<PolicyData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private route: ActivatedRoute, private router: Router, private location: Location, private exportService: ExportService, private service: PolicyService, private log_service: ActivityLogService, private dialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.message="";
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
    this.initForm();
    this.btn_add_new_policy = false;
    this.btn_existing_policy = false;
    this.btn_select_policy = false;
    this.rule_values = {};
    this.categories = {};
    this.applications = {};
    this.l3 = {};
    this.l4 = {};
    this.selectedRecord = 0;
    this.throttle = {
      "0": "",
      "1": "VOIP Throttle (5%)",
      "2": "Streaming Throttle (10%)",
      "3": "Web Throttle (20%)"
    }
    this.select_policy = "";
    this.select_existing_policy = "";
  }

  initForm() {
    this.formGroup = new FormGroup({
      add_policy: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      rule: new FormControl('', []),
      throttle: new FormControl('', []),
      start_time: new FormControl('', [Validators.required]),
      end_time: new FormControl('', [Validators.required]),
      threshold: new FormControl('', []),
      active: new FormControl('', []),
      violation: new FormControl('', []),
      description: new FormControl('', []),
      source_ip: new FormControl('', []),
      source_port: new FormControl('', []),
      destination_ip: new FormControl('', []),
      destination_port: new FormControl('', []),
      l3: new FormControl('', []),
      l4: new FormControl('', []),
      l7: new FormControl('', []),
      first_ip: new FormControl('', []),
      last_ip: new FormControl('', []),
      ip_range: new FormControl('', []),
    });
  }

  setDefaultDate() {
    this.btn_add_new_policy = !this.btn_add_new_policy;
    this.formGroup.patchValue({ start_time: this.subtractMinutes(1), end_time: new Date(), active: "1" });
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.sort = this.sort;
    this.getDropdownValues();
    //this.setPolicyTypeIPCombinations("source_ip:source_port:destination_ip:l3:l4:l7", "72832891:23:89610107:0:12:17");
  }
  getDropdownValues() {
    this.service.getDropdownValues().subscribe((res) => {
      this.categories = res.categories;
      this.applications = res.applications;
      this.l3 = res.l3;
      this.l4 = res.l4;
      this.existing_policies = res.policy_types;
      this.getAllData();
    });
  }

  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  setTableData(results): void {

    this.dataSource = null;
    this.dataSource = new MatTableDataSource(results);
  }

  onSelectedType() {
    this.policy_type = this.formGroup.value.type;
    if (this.policy_type == "category") {
      this.rule_values = this.categories;
    } else if (this.policy_type == "application") {
      this.rule_values = this.applications;
    }
  }

  setPolicyTypeIPCombinations(rule_type: string, rule_name: string) {
    let type_arr = rule_type.split(':');
    let rule_arr = rule_name.split(':');
    console.log(type_arr);

    let final_str = "";
    for (var x = 0; x < type_arr.length; x++) {
      if (type_arr[x].includes("ip")) {
        final_str += this.num2dot(rule_arr[x]);
      } else if (type_arr[x] == "l3") {
        console.log(this.l3);

        final_str += this.l3[rule_arr[x]];
      } else if (type_arr[x] == "l4") {
        final_str += this.l4[rule_arr[x]];
      } else if (type_arr[x] == "l7") {
        final_str += this.applications[rule_arr[x]];
      } else {
        final_str += rule_arr[x];
      }

      if (x < type_arr.length - 1) {
        final_str += ":";
      }
      //   console.log(final_str);
    }
    return final_str

  }

  setRuleName(rule_type: string, rule_name: string) {
    if (rule_type == "category") {
      return this.categories[rule_name];
    } else if (rule_type == "application") {
      return this.applications[rule_name];
    } else if (rule_type.includes("range")) {
      let range = rule_name.split(':');
      let result = this.num2dot(range[0]) + ":" + this.num2dot(range[1]);
      return result;
    } else if (rule_type == "sid" || rule_type == "url" || rule_type == "host") {
      return rule_name;
    } else {
      return this.setPolicyTypeIPCombinations(rule_type, rule_name);
      //return rule_name;
    }
  }

  getPolicyData() {
    //    this.formGroup.reset();
    this.service.getPolicyData(this.select_policy).subscribe((res) => {
      console.log(res);

      for (var x in res) {
        res[x].start_time = new Date(res[x].start_time * 1000);
        if (res[x].end_time > 0) {
          res[x].end_time = new Date(res[x].end_time * 1000);
        } else {
          res[x].end_time = "Indefinite";
        }
        res[x].name = this.setRuleName(res[x].type, res[x].name);
      }
      this.readData = res;
      this.setTableData(res);
    });
  }

  getExistingPolicyData() {

    this.service.getExistingPolicyData(this.select_existing_policy).subscribe((res) => {
      if (this.select_existing_policy != "category_expanded") {
        console.log(res);
        this.displayedColumns = this.defaultColumns;
        for (var x in res) {
          res[x].start_time = new Date(res[x].start_time * 1000);
          if (res[x].end_time > 0) {
            res[x].end_time = new Date(res[x].end_time * 1000);
          } else {
            res[x].end_time = "Indefinite";
          }
          res[x].name = this.setRuleName(res[x].type, res[x].name);
        }
      } else {
        this.displayedColumns = this.displayedCategoryColumns;
        for (var x in res) {
          res[x].last_accessed = new Date(res[x].last_accessed * 1000);
        }
      }
      this.readData = res;
      this.setTableData(res);
    });
  }

  getAllData() {
    this.service.getAllData().subscribe((res) => {

      for (var x in res) {
        res[x].start_time = new Date(res[x].start_time * 1000);
        if (res[x].end_time > 0) {
          res[x].end_time = new Date(res[x].end_time * 1000);
        } else {
          res[x].end_time = "Indefinite";
        }
        res[x].name = this.setRuleName(res[x].type, res[x].name);
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
      d = d+ '.' + num % 256 ;
    }
    return d;
  }

  setDataAccordPolicyType(search = false) {
    let policy_data: any = {};
    policy_data.type = this.formGroup.value.type;
    if (policy_data.type == "ip") {
      policy_data.type = "";
      policy_data.name = "";
      if (this.formGroup.value.source_ip != null) {
        policy_data.type += "source_ip:";
        policy_data.name += this.dot2num(this.formGroup.value.source_ip) + ":"
      }
      if (this.formGroup.value.source_port != null) {
        policy_data.type += "source_port:";
        policy_data.name += this.formGroup.value.source_port + ":";
      }
      if (this.formGroup.value.destination_ip != null) {
        policy_data.type += "destination_ip:";
        policy_data.name += this.dot2num(this.formGroup.value.destination_ip) + ":"
      }
      if (this.formGroup.value.destination_port != null) {
        policy_data.type += "destination_port:";
        policy_data.name += this.formGroup.value.destination_port + ":";
      }
      if (this.formGroup.value.l3 != null) {
        policy_data.type += "l3:";
        policy_data.name += this.formGroup.value.l3 + ":"
      }
      if (this.formGroup.value.l4 != null) {
        policy_data.type += "l4:";
        policy_data.name += this.formGroup.value.l4 + ":"
      }
      if (this.formGroup.value.l7 != null) {
        policy_data.type += "l7:";
        policy_data.name += this.formGroup.value.l7 + ":"
      }

      if (!search && policy_data.type == "") {
        alert("Please Enter Any Data of IP");
        return;
      }

      policy_data.type = policy_data.type.slice(0, -1);
      policy_data.name = policy_data.name.slice(0, -1);

    } else if (policy_data.type.includes("range")) {
      policy_data.type = this.formGroup.value.ip_range;
      policy_data.name = this.dot2num(this.formGroup.value.first_ip) + ":" + this.dot2num(this.formGroup.value.last_ip);
    } else {
      if (!search && (this.formGroup.value.rule == null || this.formGroup.value.rule == "")) {
        alert("Please Enter/Select Rule!");
        return;
      }
      policy_data.name = this.formGroup.value.rule;
    }
    console.log(policy_data);

    return policy_data;
  }

  setAddData() {
    let policy_data: any = {};

    if (this.formGroup.valid) {
     policy_data = this.setDataAccordPolicyType();
      policy_data.policy_category = this.formGroup.value.add_policy;
     // policy_data.type = this.formGroup.value.type;
      policy_data.throttle = this.formGroup.value.throttle;
      policy_data.start_time = (this.formGroup.value.start_time.getTime() - this.formGroup.value.start_time.getMilliseconds()) / 1000;
      policy_data.end_time = (this.formGroup.value.end_time.getTime() - this.formGroup.value.end_time.getMilliseconds()) / 1000;
      policy_data.sessions_to_skip = this.formGroup.value.threshold;
      policy_data.active = this.formGroup.value.active;
      policy_data.violation = this.formGroup.value.violation;
      policy_data.description = this.formGroup.value.description;

    }
    console.log(policy_data);
    this.message="Data added successfully";
    return policy_data;

  }

  // add data
  addData() {

    let addData = this.setAddData();
    if (addData == undefined) return;

    this.service.addPolicyData(addData).subscribe((res) => {
     // alert(res);
     this.message="Data added successfully";
      this.formGroup.reset();
      this.setDefaultDate();
      this.getAllData(); // to update table
    });
  }

  setSearchData() {
    let data = { ...this.formGroup.value };

    if (data.add_policy == "") {
      //alert("Please Select Policy!");
      this.message="Please Select Policy!";
      return;
    }
    if (data.type != "") {
      let modified_data = this.setDataAccordPolicyType(true);
      data = { ...data, ...modified_data};
    };
    console.log(data);

  for(var x in data) {
  if (data[x] == null || data[x] == '' || x == "rule" || x == "first_ip" || x == "last_ip"  || x == "ip_range" || x == "source_ip"  || x == "source_port" || x == "destination_ip"  || x == "destination_port"  || x == "l3" || x == "l4"  || x == "l7" ) {
    delete data[x];
  } else if (x == "start_time") {
    let time = this.formGroup.value.start_time.getTime();
    data.start_time = (time / 1000);
  } else if (x == "end_time") {
    data.end_time = (this.formGroup.value.end_time.getTime() / 1000);
  }
}


console.log(data);

return data;
  }
// search data
searchData() {
  // let policy_data: any = {};
  // if(this.formGroup.value.violation != "" &&this.formGroup.value.violation != null){
  //   policy_data.violation = this.formGroup.value.violation;
  // }
  // policy_data.violation = this.formGroup.value.violation;
  // policy_data.description = this.formGroup.value.description;
  // policy_data.sessions_to_skip = this.formGroup.value.sessions_to_skip;
  // policy_data.active = this.formGroup.value.active;
  // policy_data.throttle = this.formGroup.value.throttle;
  // policy_data.source_id = this.selectedRecord;
  //   this.service.searchData(policy_data).subscribe((res) => {
  //     console.log("checking",res);
  //     alert(res);
  //     this.formGroup.reset();
  //   }, error => {
  //     console.log("eror",error.message);
  //     alert("Cannot Add Data, Try to contact developer!.");
  //   });

  let search_data = this.setSearchData();

  this.service.searchData(search_data).subscribe((res) => {

    for (var x in res) {
      res[x].start_time = new Date(res[x].start_time * 1000);
        if (res[x].end_time > 0) {
          res[x].end_time = new Date(res[x].end_time * 1000);
        } else {
          res[x].end_time = "Indefinite";
        }
        res[x].name = this.setRuleName(res[x].type, res[x].name);
    }
    this.readData = res;
    this.setTableData(res);
  }, error => {
    console.log(error.message);
    this.message="Cannot Search Data, Try to contact developer!.";
   // alert("Cannot Add Data, Try to contact developer!.");
  });

}
setUpdatePolicyData() {
  let policy_data: any = {};
  policy_data.violation = this.formGroup.value.violation;
  policy_data.description = this.formGroup.value.description;
  policy_data.sessions_to_skip = this.formGroup.value.threshold;
  policy_data.active = this.formGroup.value.active;
  policy_data.throttle = this.formGroup.value.throttle;
  policy_data.source_id = this.selectedRecord;
  if (policy_data.throttle == "null") {
    policy_data.throttle = 0;
    }
  return policy_data;
}
// update data
updateData() {
  let update_data = this.setUpdatePolicyData();
  this.service.updateData(update_data).subscribe((res) => {
    console.log("checking", res);
   // alert(res);
   this.message="Data Updated successfully.";

    this.clearForm();
  }, error => {
    console.log("eror", error.message);
    this.message="Cannot update Data, Try to contact developer!.";
   // alert("Cannot Add Data, Try to contact developer!.");
  });

}
// clear form
clearForm() {

  this.formGroup.reset();

  this.setDefaultDate();
  this.name = "";
  // this.type = "";
  this.getAllData();

}
// deactivate data
deactivateData() {
  if (this.selectedRecord != 0) {
    this.service.deactivateData({ source_id: this.selectedRecord }).subscribe((res) => {
      console.log(res);
      this.message="Data Deactivated";
     // alert(res);
      this.clearForm();
    }, error => {
      console.log(error.message);
      this.message="Error Try to contact developer!.";
      //alert("Cannot Add Data, Try to contact developer!.");
    });
  }

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
setPolicyIPFields(rule_type: string, rule_name: string) {
  let rule_data: any = { type: "ip" };
  let type_arr = rule_type.split(':');
  let rule_arr = rule_name.split(':');
  let value = "";
  for (var x = 0; x < type_arr.length; x++) {
    value = rule_arr[x];
    if (type_arr[x] == "l3") {
      value = this.getJSONKeyByValue(this.l3, value);
    } else if (type_arr[x] == "l4") {
      value = this.getJSONKeyByValue(this.l4, value);
    } else if (type_arr[x] == "l7") {
      value = this.getJSONKeyByValue(this.applications, value);
    }
    rule_data[type_arr[x]] = value;

  }
  return rule_data;
}

//set range ip
setIPRangeFields(rule_type: string, rule_name: string) {
  let rule_data: any = { type: "ip_range", ip_range: rule_type };
  let rule_arr = rule_name.split(':');
  rule_data.first_ip = rule_arr[0];
  rule_data.last_ip = rule_arr[1];
  return rule_data;
}
// click event
tableRowClick(row: any) {
  this.formGroup.reset();
  this.selectedRecord = row.source_id;
  this.btn_add_new_policy = true;
  if (row.end_time == "Indefinite") {
    row.end_time = 0;
  }
  this.formGroup.patchValue({
    add_policy: row.policy_category + "",
    type: row.type,
    throttle: row.throttle + "",
    start_time: row.start_time,
    end_time: row.end_time,
    threshold: row.sessions_to_skip,
    active: row.active + "",
    violation: row.violation,
    description: row.description
  });

  this.policy_type = row.type;
  if (this.policy_type == "category") {
    this.rule_values = this.categories;
    let name = this.getJSONKeyByValue(this.categories, row.name);
    this.formGroup.patchValue({ rule: name });
  } else if (this.policy_type == "application") {
    this.rule_values = this.applications;
    let name = this.getJSONKeyByValue(this.applications, row.name);
    this.formGroup.patchValue({ rule: name });
  } else if (this.policy_type == "url" || this.policy_type == "host" || this.policy_type == "sid") {
    this.formGroup.patchValue({ rule: row.name });
  } else if (this.policy_type.includes("range")) {
    this.policy_type = "ip_range";
    let rule_data = this.setIPRangeFields(row.type, row.name);
    this.formGroup.patchValue(rule_data);
  } else {
    this.policy_type = "ip";
    let rule_data = this.setPolicyIPFields(row.type, row.name);
    this.formGroup.patchValue(rule_data);
  }
}

goBack() {
  this.location.back();
}

logout() {

  this.log_service.addLog({ action: "Logout" }).subscribe((res) => {
    console.log(res);
  });
  this.router.navigate(['login']);
}


}
