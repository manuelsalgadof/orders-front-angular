import { Component, inject, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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

  job: JobResponse | null = null;
  loading = false;
  error: string | null = null;
  private pollingId: ReturnType<typeof setInterval> | null = null;

  reprocess(): void {
    this.loading = true;
    this.error = null;
    this.job = null;
    this.stopPolling();

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
    this.pollingId = setInterval(() => {
      this.jobService.getById(id).subscribe({
        next: (job) => {
          this.job = job;
          if (this.isTerminal(job.status)) this.stopPolling();
        },
        error: () => this.stopPolling()
      });
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollingId !== null) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  private isTerminal(status: string): boolean {
    return status === 'Completed' || status === 'Failed';
  }

  get isPolling(): boolean { return this.pollingId !== null; }

  ngOnDestroy(): void { this.stopPolling(); }
}
