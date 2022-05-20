import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TcServiceService {

  constructor(private _http: HttpClient) { }

  getAllData(target_type: string): Observable<any> {
    return this._http.get(`${baseUrl}target-users/getData/${target_type}`);
  }
  // dedi

  addData(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.post(`${baseUrl}target-users/addData`, data);
  }
  addLocationAnalysisData(data: any): Observable<any> {
    return this._http.post(`${baseUrl}target-users/addLocationAnalysisData`, data);
  }
  getDropdownValues(): Observable<any> {
    return this._http.get(`${baseUrl}target-users/dropdownValues`);
  }

  updateData(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.put(`${baseUrl}target-users/updateData`, data);
  }
  deactivateData(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');
    return this._http.put(`${baseUrl}target-users/deactivateData`, data);
  }
  searchData(data: any): Observable<any> {
    return this._http.post(`${baseUrl}target-users/searchData`, data);
  }

}
