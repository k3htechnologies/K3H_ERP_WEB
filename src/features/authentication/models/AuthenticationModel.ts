import type { ModuleData } from "@/features/menu/models/MenuModel"
import type { ApiResponse } from "../../../core/api/ApiResponse"

export interface EmployeeData {
  EmployeeId: number
  UniqueKey: string
  EmployeeCode: string
  FullName: string
  PersonalMobileNumber: string
  Department: string
  DepartmentMasterId: number
  Designation: string
  DesignationMasterId: number
  BranchMasterId: number
  Branch: string
  EmailId: string
  OfficeEmailId: string
  IsUpdateEmployee: boolean
  ProfilePhotoURL: string | ''
  ClientRegistrationId: number
  LastLogin: string
  Token: string
  ModuleData:ModuleData
  ProjectData: ProjectData[]
}

export interface ProjectData {
  ProjectId: number
  Uniquekey: string
  ProjectName: string
  ProjectLocation: string
  ProjectPhotoURL: string
  CompanyId: string
  CTSNumber: string
  EmployeeId: string
  NumberOfEmployee: number
  IsRedevelopment: boolean
  BussinessCategory: string
  ProjectShortName: string
  CountryMasterId: number
  CountryName: string
  DistrictMasterId: number
  DistrictName: string
  StateMasterId: number
  StateName: string
  CityMasterId: number
  CityName: string
  ZipCode: string
  ProjectScope: string
  ProjectEstimateCost: number
  ProjectAreaInSqft: string
  OnGoingBudgetCost: string
  SurveyDate: string | null
  ExpectedStartDate: string | null
  ExecutionStartDate: string | null
  SiteContactMobileNumber: string
  SiteContactName: string
  ProjectStatus: string
  RERANumber: string
  RERACertificateDate: string | null
  RERAComplitionDate: string | null
  ProjectScheme: string
  ProjectSubScheme: string
  GoogleLocation: string
  NotificationCount: number
  ClientRegistrationId: number
  CreatedById: number
  CreatedBy: string
  CreatedDate: string
  ModifiedById: number
  ModifiedBy: string
  ModifiedDate: string
  EmployeeData: any[]
  CompanyData: any[]
  ProjectWithBankDetailsData: any[]
}

export type AuthenticationResponse = ApiResponse<EmployeeData[]>;


