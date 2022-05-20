import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private _http: HttpClient) { }
  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}policy/getData`);
  }
  getAllReports(): Observable<any> {
    return this._http.get(`${baseUrl}policy/existing-reports/getReports`);
  }
  getDropdownValues(): Observable<any> {
    return this._http.get(`${baseUrl}policy/dropdownValues`);
  }
  getPolicyData(policy_type: string): Observable<any> {
    return this._http.get(`${baseUrl}policy/getDataByPolicy/${policy_type}`);
  }
  getExistingPolicyData(policy_type: string): Observable<any> {
    return this._http.get(`${baseUrl}policy/getExistingPolicy/${policy_type}`);
  }
  addPolicyData(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.post(`${baseUrl}policy/addData`, data);
  }
  searchData(data: any): Observable<any> {
    return this._http.post(`${baseUrl}policy/searchData`, data);
  }
  deactivateData(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.put(`${baseUrl}policy/deactivateData`, data);
  }
  updateData(data:any): Observable<any> {
     data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.put(`${baseUrl}policy/updateData`, data);
  }

}
