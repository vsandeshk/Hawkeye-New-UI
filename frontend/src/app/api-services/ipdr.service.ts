import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IpdrService {

  constructor(private _http: HttpClient) { }

  getAllData(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/getData`,data);
  }

  getAllDataByRange(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/getDataByRange`, data);
  }

  getAllReports(): Observable<any> {
    return this._http.get(`${baseUrl}ipdr/existing-reports/getReports`);
  }

  saveReport(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/existing-reports/saveReport`, data);
  }

  runReportQuery(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/existing-reports/runQuery`, data);
  }

  getDropdownValues(): Observable<any> {
    return this._http.get(`${baseUrl}ipdr/dropdownValues`);
  }
  getCustomizedData(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/customizeCriteria`, data);
  }

  getCommulativeData(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/commulative-results`, data);
  }

  getBandwidthUtil(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/bandwith/utilization`, data);
  }

  getBandwidthProtocol(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/bandwith/protocol`, data);
  }

  getConnectionPercentage(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/connection/percentage`, data);
  }

  getUsagePerIP(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/ipUsage`, data);
  }

  getBarChartData(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/bandwidth/barChart`, data);
  }

  getUnclassifiedTrafic(data): Observable<any> {
    return this._http.post(`${baseUrl}ipdr/traffic/unclassified`, data);
  }

}
