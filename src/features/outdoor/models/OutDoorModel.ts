import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationOutDoor {
  PageSize: number
  PageNumber: number
  OutdoorId?: number
  StartDate?: string
  EndDate?: string
  CompanyName?: string
  Status?: string
  EmployeeId?: number
  EmployeeName?: string
  SortBy?: string
  IsReport?: boolean
  ExportType?: 'Excel' | 'PDF'
}

export interface OutDoorMasterData {
  OutdoorId: number;
  Uniquekey: string;
  OutDoorDate: string;
  OutDoorTime: string;
  AccompaniedById: string;
  AccompaniedByName: string;
  DepartmentId: number;
  DepartmentName: string;
  CompanyName: string;
  CompanyAddress: string;
  VisitingCardURL: string;
  Purpose: string;
  Conclusion: string;
  PunchIn: string;
  PunchOut: string;
  PunchInAddress: string;
  PunchOutAddress: string;
  CreatedById: number | 0;
  CreatedBy: string | '';
  CreatedDate: string | null;
  ModifiedById: number | 0;
  ModifiedBy: string | '';
  ModifiedDate: string | null;
}
export interface AddUpdateOutDoor {
  OutdoorId: number;
  Uniquekey: string;
  OutDoorDate: string;
  OutDoorTime: string;
  AccompaniedById: string;
  DepartmentId: number;
  CompanyName: string;
  CompanyAddress: string;
  VisitingCardURL: string;
  RemoveVisitingCardURL: string | '';
  Purpose: string;
  Conclusion: string;
  PunchIn: string;
  PunchOut: string;
  PunchInAddress: string;
  PunchOutAddress: string;
}
export interface DeleteOutDoorRequest {
  OutdoorId: number;
  UniqueKey: string;
}

export interface PunchInOutRequest {
  OutdoorId: number;
  Punch: string;
  Address: string;
}

export interface AddUpdateConclusionRequest {
  OutdoorId: number;
  Conclusion: string;
}

export type OutDoorDataListResponse = ApiResponse<OutDoorMasterData[]>;
export type OutDoorSaveResponse = ApiResponse<OutDoorMasterData[]>;
export type OutDoorDeleteResponse = ApiResponse<OutDoorMasterData[]>;
export type OutDoorPunchInOutResponse = ApiResponse<OutDoorMasterData[]>;
export type OutDoorConclusionResponse = ApiResponse<OutDoorMasterData[]>;
