export type * from "./property";
export type * from "./tenant";
export type * from "./payment";
export type * from "./contract";
export type * from "./maintenance";
export type * from "./dashboard";

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  perPage?: number;
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}
