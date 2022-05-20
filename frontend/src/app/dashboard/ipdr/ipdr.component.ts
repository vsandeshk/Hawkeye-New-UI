import { ChangeDetectorRef, Component, AfterViewInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import { ExportService } from '../../export.service';
import { IpdrService } from '../../api-services/ipdr.service';
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
  subscriber_id: string,
  l3: string,
  l4: string,
  l7: string
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

interface DialogData {
  report_name: string;
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

@Component({
  selector: 'app-ipdr',
  templateUrl: './ipdr.component.html',
  styleUrls: ['./ipdr.component.css']
})
export class IPDRComponent implements AfterViewInit {

  formGroup: FormGroup;

  ipdr_buttons = ipdrButtons;

  fields: side_field[] = [
    { value: 'Source_ip', viewValue: 'Source IP' },
    { value: 'Source_port', viewValue: 'Source Port' },
    { value: 'Destination_ip', viewValue: 'Dest. IP' },
    { value: 'Destination_port', viewValue: 'Dest. Port' },
    { value: 'protocol_l3', viewValue: 'l3' },
    { value: 'protocol_l4', viewValue: 'l4' },
    { value: 'Protocol_l7', viewValue: 'l7' },
    { value: 'Application', viewValue: 'Application' },
    { value: 'Category', viewValue: 'Category' },
    { value: 'calling_number', viewValue: 'calling_number' },
    { value: 'called_number', viewValue: 'called_number' },
    { value: 'Packets_sent', viewValue: 'pkts sent' },
    { value: 'Bytes_sent', viewValue: 'bytes sent/s' },
    { value: 'Packets_received', viewValue: 'pkts rcvd' },
    { value: 'Bytes_received', viewValue: 'bytes rcvd/s' },
    { value: 'operator_id', viewValue: 'oprt id' },
    { value: 'area_id', viewValue: 'area id' },
    { value: 'subscriber_id', viewValue: "subscribe id" }
  ];

  report_type: string;
  mobileQuery: MediaQueryList;
  customize_criteria: boolean;
  generate_report_flag: boolean;

  data: DateRange;

  range_start_time: any;
  range_end_time: any;

  username: string;
  report_interface: string;
  report_query: string;
  btn_click: string;

  readData: any;
  l3: any;
  l4: any;
  l7: any;
  category: any;

  private _mobileQueryListener: () => void;

  displayedMainColumns: string[] = ['Source_ip', 'Source_port', 'Destination_ip', 'Destination_port', 'protocol_l3', 'protocol_l4', 'Protocol_l7', 'Category', 'pkts_sent', 'pkts_rcvd', 'bytes_sent', 'bytes_rcvd', 'calling_number', 'called_number', 'start_time', 'end_time', 'subscriber_id'];
  displayedColumns: string[] = [];
  displayedPercentageConnectionColumns: string[] = ['Percetage_connection'];
  displayedBandwidthColumns: string[] = ['data_rate_ul', 'data_rate_dl'];
  displayedBandwidthProtocolColumns: string[] = ['protocol_l3', 'protocol_l4', 'Protocol_l7', 'data_rate_ul', 'data_rate_dl'];

  displayedIPUsageColumns: string[] = ['ip_usage'];
  displayedIPUsageWithoutCustomColumns: string[] = ['Source_ip', 'Destination_ip', 'ip_usage'];
  displayedCommulateResultColumns: string[] = ['Mb_sent', 'Mb_Rcvd', 'Pkts_sent', 'Pkts_Rcvd'];
  dataSource: MatTableDataSource<IPDRData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private route: ActivatedRoute, private router: Router, private location: Location, private exportService: ExportService, private service: IpdrService, private log_service: ActivityLogService, private dialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.btn_click = "";
    //this.voip = false;
    this.displayedColumns = [...this.displayedMainColumns];

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
    let state_obj = this.router.getCurrentNavigation().extras.state;
    this.customize_criteria = false;
    // if (this.customize_criteria) {
    //   this.report_type = "customized";
    // }

    if (state_obj == undefined) {
      this.range_end_time = new Date();
      this.range_start_time = this.subtractMinutes(1);
      } else {
        this.btn_click = state_obj["btn_click"];

      this.range_end_time = state_obj["end_time"];
      this.range_start_time = state_obj["start_time"];
      }
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
    this.l3 = {};
    this.l4 = {};
    this.l7 = {};
    this.category = {};
    this.report_query = "";


  }
  getDropdownValues() {
    this.service.getDropdownValues().subscribe((res) => {
      this.category = res.categories;
      this.l7 = res.l7;
      this.l3 = res.l3;
      this.l4 = res.l4;
      console.log("dropdown......", this.l7);
      this.generateReport(false);
    });
  }
  getBandwidthProtocol() {
    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
      generate_report_flag: this.generate_report_flag,

    };
    console.log(obj.c_params);
    if (obj.c_params.length != 0) {
      this.displayedColumns = [...this.displayedBandwidthColumns];

      this.btn_click = "BandwidthProtocol";
      for (var x = obj.c_params.length - 1; x >= 0; x--) {
        this.displayedColumns.splice(0, 0, obj.c_params[x].field);
      }
    } else {
      this.displayedColumns = [...this.displayedBandwidthProtocolColumns];


    }
    console.log("displayed", this.displayedColumns);
    console.log("displayedProtocol", this.displayedBandwidthProtocolColumns);

    this.setTableData([]);
    // this.data = {
    //   from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
    //   to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
    // }

    this.service.getBandwidthProtocol(obj).subscribe((res) => {
      let data = res.data;
      this.report_query = res.query;

      console.log(res);
      for (var x in data) {
        if (data[x].Source_ip) {
          data[x].Source_ip = this.num2dot(data[x].Source_ip);
        }
        if (data[x].Destination_ip != undefined) {
          data[x].Destination_ip = this.num2dot(data[x].Destination_ip);
        }

        if (data[x].protocol_l3 != undefined) {
          //  console.log(this.l3);

          data[x].l3 = this.l3[data[x].protocol_l3];
        }
        if (data[x].protocol_l4 != undefined) {
          data[x].l4 = this.l4[data[x].protocol_l4];
          console.log(this.l7);

        }
        if (data[0].Protocol_l7 != undefined) {
          data[x].l7 = this.l7[data[x].Protocol_l7];
        }
        if (data[x].Category != undefined) {
          console.log(this.category);
          data[x].category_name = this.category[data[x].Category];
        }
      }
      // res[0].ip_usage = res[0].Mb_sent / 1000000;
      console.log("resultsss", data.l7);

      this.readData = data;
      this.setTableData(data);
    });
  }
  getUsagePerIP() {
    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
      generate_report_flag: this.generate_report_flag,

    };
    console.log(obj.c_params);
    if (obj.c_params.length != 0) {
      this.displayedColumns = [...this.displayedIPUsageColumns];

      this.btn_click = "UsageIP";
      for (var x = obj.c_params.length - 1; x >= 0; x--) {
        this.displayedColumns.splice(0, 0, obj.c_params[x].field);
      }
    } else {
      this.displayedColumns = [...this.displayedIPUsageWithoutCustomColumns];

    }
    console.log(this.displayedColumns);
    console.log(this.displayedIPUsageColumns);

    this.setTableData([]);
    // this.data = {
    //   from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
    //   to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
    // }

    this.service.getUsagePerIP(obj).subscribe((res) => {
      let data = res.data;
      this.report_query = res.query;

      console.log(res);
      for (var x in data) {
        if (data[x].Source_ip) {
          data[x].Source_ip = this.num2dot(data[x].Source_ip);
        }
        if (data[x].Destination_ip != undefined) {
          data[x].Destination_ip = this.num2dot(data[x].Destination_ip);
        }
      }
      if (data[0].protocol_l3 != undefined) {
        console.log(this.l3);

        data[0].l3 = this.l3[data[0].protocol_l3];
      }
      if (data[0].protocol_l4 != undefined) {
        data[0].l4 = this.l4[data[0].protocol_l4];
      }
      if (data[0].Protocol_l7 != undefined) {
        data[0].l7 = this.l7[data[0].Protocol_l7];
      }
      if (data[0].Category != undefined) {
        console.log(this.category);
        data[0].category_name = this.category[data[0].Category];
      }
      // res[0].ip_usage = res[0].Mb_sent / 1000000;
      console.log(data);

      this.readData = data;
      this.setTableData(data);
    });
  }
  getCommulativeData() {

    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
      generate_report_flag: this.generate_report_flag,
    };
    console.log(obj.c_params);
    this.displayedColumns = [...this.displayedCommulateResultColumns];
    this.btn_click = "CommulateResult";
    for (var x = obj.c_params.length - 1; x >= 0; x--) {
      this.displayedColumns.splice(0, 0, obj.c_params[x].field);
    }
    console.log(this.displayedColumns);
    console.log(this.displayedCommulateResultColumns);

    this.setTableData([]);
    // this.data = {
    //   from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
    //   to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
    // }

    this.service.getCommulativeData(obj).subscribe((res) => {
      let data = res.data;
      this.report_query = res.query;

      console.log("reporttttttt",this.report_query);

      console.log("datttttttttttttta...",res.data);
      console.log("querrtttttttttttttta...",res.query);


      if (data[0].Source_ip != undefined) {
        data[0].Source_ip = this.num2dot(data[0].Source_ip);
      }
      if (data[0].Destination_ip != undefined) {
        data[0].Destination_ip = this.num2dot(data[0].Destination_ip);
      }
      if (data[0].protocol_l3 != undefined) {
        console.log(this.l3);

        data[0].l3 = this.l3[data[0].protocol_l3];
      }
      if (data[0].protocol_l4 != undefined) {
        data[0].l4 = this.l4[data[0].protocol_l4];
      }
      if (data[0].Protocol_l7 != undefined) {
        data[0].l7 = this.l7[data[0].Protocol_l7];
      }
      if (data[0].Category != undefined) {
        console.log(this.category);
        data[0].category_name = this.category[data[0].Category];
      }
      data[0].Mb_sent = data[0].Mb_sent / 1000000;
      data[0].Mb_Rcvd = data[0].Mb_Rcvd / 1000000;
      console.log(data);

      this.readData = data;
      this.setTableData(data);
    });
  }

  clearReport() {
    this.btn_click = "";
    this.report_query = "";
    this.generate_report_flag = false;
    this.setTableData([]);
    this.displayedColumns = [...this.displayedMainColumns];
    this.getAllData();
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.paginator;
    //this.dataSource.sort = this.sort;
    this.getDropdownValues();
    this.username = localStorage.getItem('username');
    this.report_interface = "ipdr";
    this.report_query = "";

  }
  subtractMinutes(numOfMinutes, date = new Date()) {
    date.setMinutes(date.getMinutes() - numOfMinutes);
    return date;
  }

  customizeCriteria() {
    this.customize_criteria = true;
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

  getAllData() {
    this.formGroup.reset();

    let time_data = {
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000
    }
    this.service.getAllData(time_data).subscribe((res) => {
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
    if (dot == null) {
      return 0
    }
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

  generateReport(flag = true) {
    this.generate_report_flag = flag;
    if (this.btn_click == "") {
      this.generate_report_flag = false;
      this.getAllData();
    } else if (this.btn_click == "CommulateResult") {
      this.getCommulativeData();

    } else if (this.btn_click == "Bandwidth") {
      this.getBandwidthUtil();

    } else if (this.btn_click == "BandwidthProtocol") {
      this.getBandwidthProtocol();

    } else if (this.btn_click == "PercentageConnections") {
      this.getConnectionPercentage();

    } else if (this.btn_click == "UsageIP") {
      this.getUsagePerIP();

    }
    //  else if (this.btn_click == "customized") {
    //   this.getCustomizedData();
    // } else if (this.btn_click == "CR") {
    //   this.getCustomizedData();
    // }
  }
  getJSONKeyByValue(json_obj: any, value: string) {
    for (var key in json_obj) {
      if (json_obj[key].toLowerCase() == value.toLowerCase()) {
        return key + "";
      }
    }
    return "";
  }
  setCustomizedData() {
    let fields: customize_field[] = [];
    let value: any;
    let column: any;
    console.log(this.formGroup.value);

    for (var i = 1; i <= 4; i++) {
      if (this.formGroup.value['field' + i] != null && this.formGroup.value['field' + i] != "") {
        column = this.formGroup.value['field' + i];
        if (column == "Source_ip" || column == "Destination_ip") {
          value = this.dot2num(this.formGroup.value['value' + i]);
        } else if (column == "protocol_l3") {
          value = this.getJSONKeyByValue(this.l3, this.formGroup.value['value' + i]);
        } else if (column == "protocol_l4") {
          value = this.getJSONKeyByValue(this.l4, this.formGroup.value['value' + i]);
        } else if (column == "Protocol_l7") {
          value = this.getJSONKeyByValue(this.l7, this.formGroup.value['value' + i]);
        } else if (column == "Category") {
          console.log(this.category);

          value = this.getJSONKeyByValue(this.category, this.formGroup.value['value' + i]);
          console.log(value);

        } else if (column == "subscriber_id") {
          value = this.formGroup.value['value' + i];
        }
        else {
          value = parseInt(this.formGroup.value['value' + i]);
        }
        fields.push({
          field: column,
          value: value
        });
      }
    }
    return fields;

  }

  getCustomizedData() {

    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000
    };
    console.log(obj);

    this.service.getCustomizedData(obj).subscribe((res) => {
      console.log(res);

      for (var x in res.data) {
        res.data[x].Start_time = new Date(res.data[x].Start_time * 1000);
        res.data[x].End_time = new Date(res.data[x].End_time * 1000);
        res.data[x].Source_ip = this.num2dot(res.data[x].Source_ip);
        res.data[x].Destination_ip = this.num2dot(res.data[x].Destination_ip);
      }
      this.report_query = res.query;
      this.readData = res.data;
      this.setTableData(res.data);
    });
  }

  getAllDataByRange() {

    this.data = {
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000
    }

    this.service.getAllDataByRange(this.data).subscribe((res) => {
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
  // get bandwidh function
  getBandwidthUtil() {
    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
      generate_report_flag: this.generate_report_flag,

    };
    console.log(obj.c_params);
    this.displayedColumns = [...this.displayedBandwidthColumns];
    this.btn_click = "Bandwidth";
    for (var x = obj.c_params.length - 1; x >= 0; x--) {
      this.displayedColumns.splice(0, 0, obj.c_params[x].field);
    }
    console.log(this.displayedColumns);
    console.log(this.displayedBandwidthColumns);
    this.setTableData([]);
    this.service.getBandwidthUtil(obj).subscribe((res) => {
      let data = res.data;
      this.report_query = res.query;

      console.log(res);
      if (data[0].Source_ip != undefined) {
        data[0].Source_ip = this.num2dot(data[0].Source_ip);
      }
      if (data[0].Destination_ip != undefined) {
        data[0].Destination_ip = this.num2dot(data[0].Destination_ip);
      }
      if (data[0].protocol_l3 != undefined) {
        console.log(this.l3);

        data[0].l3 = this.l3[data[0].protocol_l3];
      }
      if (data[0].protocol_l4 != undefined) {
        data[0].l4 = this.l4[data[0].protocol_l4];
      }
      if (data[0].Protocol_l7 != undefined) {
        data[0].l7 = this.l7[data[0].Protocol_l7];
      }
      if (data[0].Category != undefined) {
        console.log(this.category);
        data[0].category_name = this.category[data[0].Category];
      }
      // res[0].Mb_sent = res[0].Mb_sent / 1000000;
      // res[0].Mb_Rcvd = res[0].Mb_Rcvd / 1000000;
      console.log(res);

      this.readData = data;
      this.setTableData(data);
    });
  }
  getConnectionPercentage() {

    let obj: any = {
      c_params: this.setCustomizedData(),
      from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
      to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
      generate_report_flag: this.generate_report_flag,

    };
    console.log(obj.c_params);
    this.displayedColumns = [...this.displayedPercentageConnectionColumns];
    this.btn_click = "PercentageConnections";
    for (var x = obj.c_params.length - 1; x >= 0; x--) {
      this.displayedColumns.splice(0, 0, obj.c_params[x].field);
    }
    console.log(this.displayedColumns);
    console.log(this.displayedPercentageConnectionColumns);

    this.setTableData([]);
    // this.data = {
    //   from_time: (this.range_start_time.getTime() - this.range_start_time.getMilliseconds()) / 1000,
    //   to_time: (this.range_end_time.getTime() - this.range_end_time.getMilliseconds()) / 1000,
    // }

    this.service.getConnectionPercentage(obj).subscribe((res) => {
      let data = res.data;
      this.report_query = res.query;


      console.log(res);

      if (data[0].Source_ip != undefined) {
        data[0].Source_ip = this.num2dot(data[0].Source_ip);
      }
      if (data[0].Destination_ip != undefined) {
        data[0].Destination_ip = this.num2dot(data[0].Destination_ip);
      }
      if (data[0].protocol_l3 != undefined) {
        console.log(this.l3);

        data[0].l3 = this.l3[data[0].protocol_l3];
      }
      if (data[0].protocol_l4 != undefined) {
        data[0].l4 = this.l4[data[0].protocol_l4];
      }
      if (data[0].Protocol_l7 != undefined) {
        data[0].l7 = this.l7[data[0].Protocol_l7];
      }
      if (data[0].Category != undefined) {
        console.log(this.category);
        data[0].category_name = this.category[data[0].Category];
      }
      data[0].Mb_sent = data[0].Mb_sent / 1000000;
      data[0].Mb_Rcvd = data[0].Mb_Rcvd / 1000000;
      console.log(res);

      this.readData = data;
      this.setTableData(data);
    });
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

  saveReport(): void {
    const dialogRef = this.dialog.open(DialogSaveReport, {
      width: '250px',
      data: { report_name: "" }
    });

    dialogRef.afterClosed().subscribe(result => {

      let has_start_time = 0;
      let has_end_time = 0;
      if (this.range_start_time != null || this.range_start_time != '') {
        has_start_time = 1;
      }
      if (this.range_end_time != null || this.range_end_time != '') {
        has_end_time = 1;
      }
      if (this.username && this.report_query != "") {
        let obj = { Report_Name: result, Report_Created_By: this.username, Report_Interface: this.report_interface, Report_Query: this.report_query, Has_Start_Time: has_start_time, Has_End_Time: has_end_time };

        console.log("object save", obj);
        this.service.saveReport(obj).subscribe((res) => {
          console.log("save trport rs", res);
          alert("Report saved!");
        });

      }
    });
  }
}


@Component({
  selector: 'dialog-save-report',
  templateUrl: 'dialog-save-report.html',
})

export class DialogSaveReport {


  constructor(public dialogRef: MatDialogRef<DialogSaveReport>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
