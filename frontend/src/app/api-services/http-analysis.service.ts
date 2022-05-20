import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';
import { DateRange } from '../dashboard/http/http.component';

@Injectable({
  providedIn: 'root'
})
export class HttpAnalysisService {
  getAllDataByRange(data: DateRange) {
    throw new Error('Method not implemented.');
  }

  constructor(private _http: HttpClient) { }

  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}https/getData`);
  }
  searchByAnyKeyword(data:any):Observable<any> {
    return this._http.post(`${baseUrl}https/searchByAnyKeyword`, data);
  }

}
