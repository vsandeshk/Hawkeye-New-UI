import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  constructor(private _http: HttpClient) { }

  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}activity-log/getData`);
  }
  searchData(data: any): Observable<any> {
    return this._http.post(`${baseUrl}activity-log/searchData`, data);
  }
  getusername(): Observable<any> {
    return this._http.get(`${baseUrl}activity-log/getusername`);
  }
  addLog(data: any): Observable<any> {
    data.username = localStorage.getItem('username');
    data.user_role = localStorage.getItem('user_role');

    return this._http.post(`${baseUrl}activity-log/addLog`, data);
  }

}
