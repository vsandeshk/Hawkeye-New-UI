import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DnsService {

  constructor(private _http: HttpClient) { }

  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}dns/getData`);
  }
  searchData(data:any): Observable<any> {
    return this._http.post(`${baseUrl}dns/searchData`, data);
  }
  getAccessCount(): Observable<any> {
    return this._http.get(`${baseUrl}dns/accessCount`);
  }
  getCategories():Observable<any> {
    return this._http.get(`${baseUrl}category/getCategories`);
  }
  searchByAnyKeyword(data:any):Observable<any> {
    return this._http.post(`${baseUrl}dns/searchByAnyKeyword`, data);
  }
}
