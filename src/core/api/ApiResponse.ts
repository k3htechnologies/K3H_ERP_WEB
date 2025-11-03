export interface ApiResponse<T = any> {
  SuccessMessage: string[]
  ErrorMessage: string[]
  WarningMessage: string[]
  Data: T
  IsSuccess: boolean
  TotalNumberOfRecord: number
  HttpStatusCode: number
}
