import type { ApiResponse } from "@/core/api/ApiResponse"
import type { EmployeeData } from "@/features/authentication/models/AuthenticationModel"
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel"
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel"

export interface FilterWithPaginationProjectMasterRequest {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    IsProjectAccess?: boolean
    ProjectLocation?: string
    ProjectName?: string
    CTCNumber?: string
    EmployeeId?: number
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface ProjectMasterData {
    ProjectId: number | 0;
    Uniquekey: string | '';
    ProjectName: string | '';
    ProjectLocation: string | '';

    ProjectPhotoURL: string | '';
    CompanyId: string | '';

    CTSNumber: string | '';
    EmployeeId: string | '';
    NumberOfEmployee: number | 0;
    IsRedevelopment: boolean | false;

    FileNumber: string | '';
    ArchitectName: string | '';
    ArchitectMobileNumber: string | '';

    // ADVANCE DETAILS
    BussinessCategory: string | '';
    ProjectShortName: string | '';

    CountryMasterId: number | 0;
    CountryName: string | '';

    DistrictMasterId: number | 0;
    DistrictName: string | '';

    StateMasterId: number | 0;
    StateName: string | '';

    CityMasterId: number | 0;
    CityName: string | '';

    VillageMasterId: number | 0;
    VillageName: string | '';

    ZipCode: string | '';

    ProjectScope: string | '';
    ProjectEstimateCost: number | 0;
    ProjectAreaInSqft: string | '';
    OnGoingBudgetCost: string | '';

    SurveyDate: string | null;
    ExpectedStartDate: string | null;
    ExecutionStartDate: string | null;

    SiteContactMobileNumber: string | '';
    SiteContactName: string | '';
    ProjectStatus: string | '';
    RERANumber: string | '';

    RERACertificateDate: string | null;
    RERAComplitionDate: string | null;

    ProjectScheme: string | '';
    ProjectSubScheme: string | '';
    GoogleLocation: string | '';

    // Notification
    NotificationCount: number | 0;
    ClientRegistrationId: number | 0;

    // REFERENCES

    EmployeeData: EmployeeData[] | [];
    CompanyData: CompanyMasterData[] | [];
    ProjectWithBankDetailsData: ProjectWithBankDetails[] | [];
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProjectWithBankDetails {
    ProjectWithBankDetailsId: number | 0;
    Uniquekey: string | '';
    ProjectId: number | 0;
    ProjectName: string | '';
    BeneficiaryAccountHolderName: string | '';
    BankListMasterId: number | 0;
    BankName: string | '';
    AccountNumber: string | '';
    Branch: string | '';
    IFSCCode: string | '';
    AcType: string | '';
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProjectMasterRequest {
    ProjectId: number | 0;
    Uniquekey: string | '';
    ProjectName: string | '';
    ProjectLocation: string | '';
    ProjectPhotoURL: (File | string)[] | null;
    RemoveProjectPhotoURL: string | '';
    CTSNumber: string | '';
    IsRedevelopment: number | 0;
    FileNumber: string | '';
    ArchitectName: string | '';
    ArchitectMobileNumber: string | '';

    // ADVANCE DETAILS
    BussinessCategory: string | '';
    ProjectShortName: string | '';
    CountryMasterId: number | 0;
    DistrictMasterId: number | 0;
    StateMasterId: number | 0;
    CityMasterId: number | 0;
    VillageMasterId: number | 0;

    ZipCode: string | '';
    ProjectScope: string | '';
    ProjectEstimateCost: number | 0;
    ProjectAreaInSqft: number | 0;
    OnGoingBudgetCost: number | 0;

    SurveyDate: string | null;
    ExpectedStartDate: string | null;
    ExecutionStartDate: string | null;

    SiteContactMobileNumber: string | '';
    SiteContactName: string | '';
    ProjectStatus: string | '';
    RERANumber: string | '';
    RERACertificateDate: string | null;
    RERAComplitionDate: string | null;

    ProjectScheme: string | '';
    ProjectSubScheme: string | '';
    GoogleLocation: string | '';
}

export interface AddUpdateProjectMasterWithEmployeeRequest {
    ProjectId: number | 0;
    Uniquekey: string | '';
    EmployeeId: string | '';
}

export interface DeleteProjectMasterWithEmployeeRequest {
    ProjectId: number | 0;
    Uniquekey: string | '';
    EmployeeId: string | '';
}

export interface AddUpdateProjectMasterWithCompanyRequest {
    ProjectId: number | 0;
    Uniquekey: string | '';
    CompanyId: string | '';
}

export interface DeleteProjectMasterWithCompanyRequest {
    ProjectId: number | 0;
    Uniquekey: string | '';
    CompanyId: string | '';
}

export interface AddUpdateProjectMasterWithBankDetailsRequest {
    ProjectWithBankDetailsId: number | 0;
    Uniquekey: string | '';
    ProjectId: number | 0;
    BeneficiaryAccountHolderName: string | '';
    BankListMasterId: number | 0;
    AccountNumber: string | '';
    Branch: string | '';
    IFSCCode: string | '';
    AcType: string | '';

}

export interface DeleteProjectMasterWithBankDetailsRequest {
    ProjectWithBankDetailsId: number | 0;
    Uniquekey: string | '';
    ProjectId: number | 0;
}

export type ProjectMasterListResponse = ApiResponse<ProjectMasterData[]>;
export type ProjectMasterSaveResponse = ApiResponse<ProjectMasterData[]>;
export type ProjectMasterWithEmployeeResponse = ApiResponse<EmployeeMasterData[]>;
export type ProjectMasterWithEmployeeSaveResponse = ApiResponse<EmployeeMasterData[]>;
export type ProjectMasterWithEmployeeDeleteResponse = ApiResponse<number>;
export type ProjectMasterWithCompanyResponse = ApiResponse<CompanyMasterData[]>;
export type ProjectMasterWithCompanySaveResponse = ApiResponse<CompanyMasterData[]>;
export type ProjectMasterWithCompanyDeleteResponse = ApiResponse<number>;
export type ProjectMasterWithBankDetailsResponse = ApiResponse<ProjectWithBankDetails[]>;
export type ProjectMasterWithBankDetailsSaveResponse = ApiResponse<ProjectWithBankDetails[]>;
export type ProjectMasterWithBankDetailsDeleteResponse = ApiResponse<number>;