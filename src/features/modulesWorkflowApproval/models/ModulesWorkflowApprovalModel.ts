import type { ApiResponse } from "@/core/api/ApiResponse";
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";

export interface FilterModulesWorkflowApprovalRequest {
  EmployeeId?: number;
  ProjectId?: number;
  SortBy?: string;
  ExportType?: "Excel" | "PDF";
}

export interface ModulesWorkflowApprovalData {
  ModuleName?: string | null;
  ModulesMasterId?: number | 0;
  SubModulesMasterId?: number | 0;
  SubSubModulesMasterId?: number | 0;
  SubSubModuleName?: string | null;
  EmployeeData?: EmployeeMasterData[] | null;
}

export interface AddUpdateModulesWorkflowApprovalRequest {
  EmployeeId?: string | "";
  ProjectId?: number | 0;
  ModulesMasterId?: number | 0;
  SubModulesMasterId?: number | 0;
  SubSubModulesMasterId?: number | 0;
}

export interface DeleteModulesWorkflowApprovalRequest {
  EmployeeId?: number | 0;
  ProjectId?: number | 0;
  ModulesMasterId?: number | 0;
  SubModulesMasterId?: number | 0;
  SubSubModulesMasterId?: number | 0;
}

export interface UpdateModulesWorkflowApprovalRequest {
  ModuleName?: string | null;
  Id?: number | 0;
  SubId?: number | 0;
  SubSubId?: number | 0;
  SubSubSubId?: number | 0;
  IsApproved?: boolean | null;
  Remarks?: string | null;
  ProjectId?: number | 0;
}

export interface ModulesWorkflowApprovalSummaryRequest {
  Id?: number | 0;
  ModuleName?: string | null;
}

export interface ModulesWorkflowApprovalSummaryData {
  EmployeeName?: string | null;
  ModuleName?: string | null;
  IsApproved?: string | null;
  Remarks?: string | null;
  Date?: string | null;
}

export interface ModulesApprovalStatusRequest {
  ModuleName?: string | null;
  Id?: number | 0;
  SubId?: number | 0;
  SubSubId?: number | 0;
  SubSubSubId?: number | 0;
  ProjectId?: number | 0;
}

export interface ModulesApprovalStatusData
{
     EmployeeCode? : string | null;
     FullName? : string | null;
     EmailId? : string | null;
     OfficeEmailId? : string | null;
     PersonalMobileNumber? : string | null;
     Department? : string | null;
     Designation? : string | null;
     Branch? : string | null;
     ApprovalStatus? : string | null;
     Remarks? : string | null;
     DateTime?: string | null;
}

export type ModulesWorkflowApprovalListResponse = ApiResponse<ModulesWorkflowApprovalData[]>;
export type ModulesWorkflowApprovalSaveResponse = ApiResponse<ModulesWorkflowApprovalData[]>;
export type ModulesWorkflowApprovalDeleteResponse = ApiResponse<number[]>;
export type UpdateModulesWorkflowApprovalResponse = ApiResponse<string[]>;
export type ModulesApprovalStatusListResponse = ApiResponse<ModulesApprovalStatusData[]>;
export type ModulesWorkflowApprovalSummaryListResponse = ApiResponse<ModulesWorkflowApprovalSummaryData[]>;
