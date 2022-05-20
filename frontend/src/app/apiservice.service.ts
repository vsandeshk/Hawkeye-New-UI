import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {

  constructor(private _http:HttpClient) { }
  // to connect frontend from backend

  apiURL = 'http://localhost:3000/getData/ipdr';
  apiURL1 = 'http://localhost:3000/target_users';
  apiURL2 = 'http://localhost:3000/email';
  apiURL3 = 'http://localhost:3000/https';
  apiURL4 = 'http://localhost:3000/dns';
  // get all data

  getAllData():Observable<any>
  {
    return this._http.get(`${this.apiURL}`);
  }

}
