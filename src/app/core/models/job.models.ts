export interface JobResponse {
  id: string;
  type: string;
  status: string;
  message: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}
