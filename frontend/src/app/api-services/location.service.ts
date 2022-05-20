import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private _http: HttpClient) { }

  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}location/getData`);
  }
  searchData(data:any): Observable<any> {
    return this._http.post(`${baseUrl}location/searchData`, data);
  }
  searchByAnyKeyword(data:any):Observable<any> {
    return this._http.post(`${baseUrl}location/searchByAnyKeyword`, data);
  }
  getIPDetails(ip_address:string):Observable<any> {
    return this._http.get(`http://ip-api.com/json/${ip_address}`);
  }
}
