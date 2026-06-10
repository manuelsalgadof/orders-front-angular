import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobResponse } from '../models/job.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly base = `${environment.apiUrl}/api/Jobs`;

  constructor(private http: HttpClient) {}

  reprocess(): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.base}/reprocess-orders`, null);
  }

  getById(id: string): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.base}/${id}`);
  }
}
