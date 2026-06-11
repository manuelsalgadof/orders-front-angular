export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  items: T[];
}
