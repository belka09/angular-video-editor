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

  /**
   * Sends a POST request to process the provided video files.
   * @param data - A `FormData` object containing video files and processing parameters.
   * @returns An observable emitting the server's response.
   */
  processVideos(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, data);
  }

  /**
   * Retrieves a processed video by its ID.
   * @param id - The unique identifier of the video to fetch.
   * @returns An observable emitting the video file as a Blob.
   */
  getVideoById(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/video/${id}`, {
      responseType: 'blob',
    });
  }
}
