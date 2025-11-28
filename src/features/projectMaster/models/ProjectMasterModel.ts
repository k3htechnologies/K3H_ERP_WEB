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

    // ADVANCE DETAILS
    BussinessCategory: string | '';
    ProjectShortName: string | '';
    CountryMasterId: number | 0;
    DistrictMasterId: number | 0;
    StateMasterId: number | 0;
    CityMasterId: number | 0;

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

export type ProjectMasterListResponse = ApiResponse<ProjectMasterData[]>;
export type ProjectMasterSaveResponse = ApiResponse<ProjectMasterData[]>;


export type ProjectMasterWithEmployeeResponse = ApiResponse<EmployeeMasterData[]>;
export type ProjectMasterWithCompanyResponse = ApiResponse<CompanyMasterData[]>;
export type ProjectMasterWithBankDetailsResponse = ApiResponse<ProjectWithBankDetails[]>;