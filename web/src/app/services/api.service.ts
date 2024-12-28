import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  processVideos(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, data);
  }

  getVideo(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/video/${id}`, {
      responseType: 'blob',
    });
  }
}
