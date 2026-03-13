import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationEmployeeMasterRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  EmployeeId?: number
  EmployeeCode?: string | ''
  EmployeeName?: string | ''
  MobileNumber?: string | ''
  Gender?: string | ''
  DepartmentName?: string | ''
  DesignationName?: string | ''
  BranchName?: string | ''
  CompanyName?: string | ''
  ReportPersonName?: string | ''
  EmailId?: string | ''
  BankName?: string | ''
  BankBranchName?: string | ''
  IsEmployeeOnProbation?: string | ''
  IsIdCardIssued?: string | ''
  FromDateOfBirth?: string | ''
  ToDateOfBirth?: string | ''
  FromJoiningDate?: string | ''
  ToJoiningDate?: string | ''
  SortBy?: string
  ExportType?: 'Excel' | 'PDF'
}

export interface EmployeeMasterData {
  EmployeeId: number
  UniqueKey: string
  EmployeeCode: string | ''
  FirstName: string | ''
  MiddleName: string | ''
  LastName: string | ''
  FullName: string | ''
  DepartmentMasterId: number | 0
  Department: string | ''
  DesignationMasterId: number | 0
  Designation: string | ''
  BranchMasterId: number | 0
  Branch: string | ''
  Gender: string | ''
  MaritalStatus: string | ''
  DateOfBirth: string | null
  JoiningDate: string | null
  ProbationDate: string | null
  ResignationDate: string | null
  IdCardIssuedDate: string | null
  IsGeoFenceLocation: boolean | false
  EmailId: string | ''
  OfficeEmailId: string | ''
  ReportPersonId: number | 0
  ReportPersonName: string | ''
  PersonalMobileNumber: string | ''
  OfficeMobileNumber: string | ''
  BankListMasterId: number | 0
  BankName: string | ''
  BankBranchName: string | ''
  IFSCCode: string | ''
  AccountNo: string | ''
  EmployeeType: string | ''
  EmergencyMobileNumber: string | ''
  EmergencyContactPersonRelationship: string | ''
  IsUpdateEmployee: boolean | false
  CommunicationAddress: string | ''
  PermanentAddress: string | ''
  BloodGroup: string | ''
  CompanyId: number | 0
  CompanyName: string | ''
  LastLogin: string | null
  CountryMasterId: number | 0
  CountryName: string | ''
  StateMasterId: number | 0
  StateName: string | ''
  DistrictMasterId: number | 0
  DistrictName: string | ''
  CityMasterId: number | 0
  CityName: string | ''
  ClientRegistrationId: number | 0
  CreatedById: number | 0
  CreatedBy: string | ''
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ''
  ModifiedDate: string | null
  LastModifiedBy: string | ''
  LastModifiedDate: string | null
  EmployeeReportingCycleData: EmployeeReportingCycle[] | [];
}

export interface EmployeeReportingCycle {
  EmployeeCode: string | null;
  FullName: string | null;
  Designation: string | null;
  EmailId: string | null;
  PersonalMobileNumber: string | null;
}


export interface AddUpdateEmployeeMasterRequest {
  EmployeeId: number;
  UniqueKey: string | null;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  DepartmentMasterId: number | null;
  DesignationMasterId: number | null;
  BranchMasterId: number | null;
  Gender: string;
  MaritalStatus: string;
  DateOfBirth: string | null;
  JoiningDate: string | null;
  IdCardIssuedDate: string | null
  IsGeoFenceLocation: boolean;
  EmailId: string;
  OfficeEmailId: string;
  ReportPersonId: number | null;
  PersonalMobileNumber: string;
  OfficeMobileNumber: string;
  BankListMasterId: number | null;
  BankBranchName: string;
  IFSCCode: string;
  AccountNo: string;
  EmployeeType: string;
  EmergencyMobileNumber: string;
  EmergencyContactPersonRelationship: string;
  CommunicationAddress: string;
  PermanentAddress: string;
  BloodGroup: string;
  CompanyId: number | null;
  CountryMasterId: number | null;
  StateMasterId: number | null;
  DistrictMasterId: number | null;
  CityMasterId: number | null;
}

export interface UpdateEmployeeMasterRequest {
  EmployeeId: number;
  UniqueKey: string | null;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Gender: string
  MaritalStatus:string
  DateOfBirth:string
  EmailId:string
  PersonalMobileNumber:string
  CommunicationAddress:string
  PermanentAddress:string
  BloodGroup:string
}

export interface FilterWithPaginationLocationRequest {
  countryId?: number;
  StateName: string;
  stateId?: number;
  CityId?: number;
  DistrictId?: number;
  VillageId?: number;
  SearchText?: string;
  PageNumber?: number;
  PageSize?: number;
  IsCheckPermission: boolean;
}
export interface Country {
  id: number;
  name: string;
}

export interface State {
  StateId: number;
  StateName: string;
  countryId: number;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
}

export interface District {
  id: number;
  name: string;
  cityId: number;
}

export interface Village {
  id: number;
  name: string;
  districtId: number;
}
export interface LocationListResponse {
  CountryMasterId: number;
  CountryName: string;
  StateMasterId: number;
  StateName: string;
  DistrictMasterId: number;
  DistrictName: string;
  CityMasterId: number;
  CityName: string;
  VillageMasterId: number;
  VillageName: string;
}
export interface LocationDataWrapper {
  CountryStateCityDistrictVillageData: LocationListResponse[];
}

export interface SetEmployeeMPINRequest {
  EmployeeId: number;
  UniqueKey: string | null;
  MPIN: string;
}

export type LocationResponse = ApiResponse<LocationDataWrapper>;
export type EmployeeMasterListResponse = ApiResponse<EmployeeMasterData[]>;
export type EmployeeMasterSaveResponse = ApiResponse<EmployeeMasterData[]>;
export type EmployeeMPINRequestResponse = ApiResponse<String>;