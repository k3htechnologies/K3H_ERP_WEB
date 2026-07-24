export interface DepartmentItem {
  RoleId: number;
  DepartmentId: number;
  DepartmentName: string;
  TotalRoles: number;
}

export interface SkillOption {
  name?: string;
  label?: string;
}

export interface JobRole {
  JobRoleId: number;
  UniqueKey: string;
  DepartmentId: number;
  DepartmentName: string;
  RoleName: string;
  RoleDescription: string;
  RoleQualification: string;
  RoleResponsibility: string;
  JobRequirement: string;
  RoleSkills: string | SkillOption[];
  IsCopy?: string;
  IsActive?: boolean;
  Status?: string;
  WorkMode?: string;
  ExperienceYears?: number;
  ExperienceMonths?: number;
  WorkLocation?: string;
  EmploymentType?: string;
  CreatedAt?: string;
}

export interface FilterWithPaginationJobRoleRequest {
  PageSize?: number;
  PageNumber?: number;
  JobRoleId?: number;
  DepartmentId?: number;
  DepartmentName?: string;
  RoleName?: string;
  RoleSkills?: string;
  IsActive?: boolean;
  SortBy?: string;
  ExportType?: "Excel" | "PDF";
}

export interface ApiResponse<T> {
  IsSuccess: boolean;
  Data: T | null;
  SuccessMessage?: string[];
  ErrorMessage?: string[];
  WarningMessage?: string[];
  TotalNumberOfRecord?: number;
  HttpStatusCode: number;
}

export type JobDepartmentListResponse = ApiResponse<DepartmentItem[]>;
export type JobRoleListResponse = ApiResponse<
  JobRole[] | string | Record<string, unknown>
>;

export interface JobRoleSaveRequest {
  JobRoleId: number;
  UniqueKey: string;
  DepartmentId: number;
  RoleName: string;
  RoleDescription: string;
  RoleQualification: string;
  RoleResponsibility: string;
  JobRequirement: string;
  RoleSkills: string;
  IsCopy: string;
}

export interface DeleteJobRoleRequest {
  JobRoleId: number;
  UniqueKey: string;
}

export type JobRoleMutationResponse = ApiResponse<JobRole | number | null>;
