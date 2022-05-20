import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // searchByAnyKeyword(data: any) {
  //   throw new Error('Method not implemented.');
  // }

  constructor(private _http: HttpClient) { }

  getAllData(): Observable<any> {
    return this._http.get(`${baseUrl}email/getData`);
  }
  searchData(data:any): Observable<any> {
    return this._http.post(`${baseUrl}email/searchData`, data);
  }
  searchByAnyKeywords(data:any):Observable<any> {
    return this._http.post(`${baseUrl}email/searchByAnyKeyword`, data);
  }

}
