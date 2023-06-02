import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadYamlService {

  constructor(private httpClient:HttpClient) { 

  }

  loadYaml(path:string){
    return this.httpClient.get(path, { responseType: 'text' })
  }
}
