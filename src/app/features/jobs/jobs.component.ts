import { Component, inject, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { interval, Subject, EMPTY, Subscription } from 'rxjs';
import { switchMap, takeUntil, takeWhile, catchError } from 'rxjs/operators';
import { JobService } from '../../core/services/job.service';
import { JobResponse } from '../../core/models/job.models';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnDestroy {
  private jobService = inject(JobService);
  private stopPolling$ = new Subject<void>();
  private pollSub: Subscription | null = null;

  job: JobResponse | null = null;
  loading = false;
  error: string | null = null;
  isPolling = false;

  reprocess(): void {
    this.loading = true;
    this.error = null;
    this.job = null;
    this.stopPolling$.next();

    this.jobService.reprocess().subscribe({
      next: (job) => {
        this.loading = false;
        this.job = job;
        if (!this.isTerminal(job.status)) {
          this.startPolling(job.id);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.status === 429
          ? 'Demasiadas solicitudes. Espera un momento.'
          : 'Error al lanzar reprocesamiento.';
      }
    });
  }

  private startPolling(id: string): void {
    this.isPolling = true;
    this.pollSub = interval(2000).pipe(
      switchMap(() => this.jobService.getById(id)),
      takeUntil(this.stopPolling$),
      takeWhile(job => !this.isTerminal(job.status), true),
      catchError(() => EMPTY)
    ).subscribe({
      next: (job) => { this.job = job; },
      complete: () => { this.isPolling = false; this.pollSub = null; }
    });
  }

  private isTerminal(status: string): boolean {
    return status === 'Completed' || status === 'Failed';
  }

  ngOnDestroy(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }
}
