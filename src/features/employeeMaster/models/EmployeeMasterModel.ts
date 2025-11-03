import type { ApiResponse } from "../../../core/api/ApiResponse"

export interface FilterWithPaginationEmployeeMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    EmployeeId?: number
    EmployeeName?: string | ''
    BranchName?: string | ''
    DepartmentName?: string | ''
    DesignationName?: string | ''
    EmailId?: string | ''
    MobileNumber?: string | ''
    ReportPersonName?: string | ''
    BankBranchName?: string | ''
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
}

export interface AddUpdateEmployeeMasterRequest {
    EmployeeId?: number
    UniqueKey?: string
    FirstName?: string
    MiddleName?: string
    LastName?: string
    DepartmentMasterId?: number
    DesignationMasterId?: number
    BranchMasterId?: number
    Gender?: string
    MaritalStatus?: string
    DateOfBirth?: string
    JoiningDate?: string
    IsGeoFenceLocation?: boolean
    EmailId?: string
    OfficeEmailId?: string
    ReportPersonId?: number
    PersonalMobileNumber?: string
    OfficeMobileNumber?: string
    BankListMasterId?: number
    BankBranchName?: string
    IFSCCode?: string
    AccountNo?: string
    EmployeeType?: string
    EmergencyMobileNumber?: string
    EmergencyContactPersonRelationship?: string
    CommunicationAddress?: string
    PermanentAddress?: string
    BloodGroup?: string
    CompanyId?: number
    CountryMasterId?: number
    StateMasterId?: number
    DistrictMasterId?: number
    CityMasterId?: number
}


export type EmployeeMasterListResponse = ApiResponse<EmployeeMasterData>;
export type EmployeeMasterSaveResponse = ApiResponse<EmployeeMasterData>;
