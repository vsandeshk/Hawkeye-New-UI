import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class IpdrLiveService {

  constructor(private _http: HttpClient) { }
  getData(): Observable<any> {
    return this._http.get(`${baseUrl}liveipdr/getData`);
  }
  searchByAnyKeywords(data:any):Observable<any> {
    return this._http.post(`${baseUrl}liveipdr/searchByAnyKeyword`, data);
  }
}
