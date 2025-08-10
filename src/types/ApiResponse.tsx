export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  data: T;
  message: string;
};