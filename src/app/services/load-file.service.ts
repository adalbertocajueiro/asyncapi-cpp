import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadTextFileService {

  constructor(private httpClient: HttpClient) {

  }

  loadFileAsText(path: string) {
    return this.httpClient.get(path, { responseType: 'text' })
  }
}
