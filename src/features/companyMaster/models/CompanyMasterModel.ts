import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCompanyMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    CompanyId?: number
    CompanyName?: string
    FirmsType?: string
    ContactPerson?: string
    MobileNumber?: string
    CityName?: string
    GSTNumber?: string
    CINNumber?: string
    PANNumber?: string
    TANNumber?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface CompanyMasterData {
    CompanyId: number
    Uniquekey: string
    CompanyName: string
    FirmsType: string
    ContactPerson: string
    MobileNumber: string
    LandLineNumber: string
    GSTNumber: string
    GSTCertificateURL: string
    CINNumber: string
    CINURL: string
    PANNumber: string
    PanCardURL: string
    TANNumber: string
    TANURL: string
    EmailId: string
    CountryMasterId: number
    CountryName: string
    StateMasterId: number
    StateName: string
    DistrictMasterId: number
    DistrictName: string
    CityMasterId: number
    CityName: string
    CompanyLetterheadHeaderURL: string
    CompanyLetterheadFooterURL: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
    CompanyPartnerData: CompanyPartnerData[]
}

export interface CompanyPartnerData {
    CompanyPartnerId: number
    Uniquekey: string
    CompanyId: number
    FirstName: string
    LastName: string
    MiddleName: string
    FullName: string
    DateOfBirth: string | null
    Gender: string
    MobileNumber: string
    EmailId: string
    PartnerPercentage: number
    PanNumber: string
    PanCardURL: string
    AadharCardNumber: string
    AadharCardURL: string
    PhotoURL: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateCompanyMasterRequest {
    CompanyId: number | 0
    Uniquekey: string | null
    CompanyName: string | ''
    FirmsType: string | ''
    ContactPerson: string | ''
    MobileNumber: string | ''
    EmailId: string | ''
    LandLineNumber: string | ''
    GSTNumber: string | ''
    GSTCertificateURL: File[] | null
    RemoveGSTCertificateURL: string | ''
    CINNumber: string | ''
    CINURL: File[] | null
    RemoveCINURL: string | ''
    PanNumber: string | ''
    PanCardURL: File[] | null
    RemovePanCardURL: string | ''
    TANNumber: string | ''
    TANURL: File[] | null
    RemoveTANURL: string | ''
    CountryMasterId: number | 0
    StateMasterId: number | 0
    DistrictMasterId: number | 0
    CityMasterId: number | 0
    CompanyLetterheadHeaderURL: File[] | null
    RemoveCompanyLetterheadHeaderURL: string | ''
    CompanyLetterheadFooterURL: File[] | null
    RemoveCompanyLetterheadFooterURL: string | ''
}

export interface AddUpdateCompanyPartnerRequest {
    CompanyPartnerId: number | 0
    FirstName: string | ''
    LastName: string | ''
    MiddleName: string | ''
    DateOfBirth: string | null
    Gender: string | ''
    MobileNumber: string | ''
    EmailId: string | ''
    PartnerPercentage: number | 0
    PanNumber: string | ''
    PanCardURL: File[] | null
    RemovePanCardURL: string | ''
    AadharCardNumber: string | ''
    AadharCardURL: File[] | null
    RemoveAadharCardURL: string | ''
    PhotoURL: File[] | null
    RemovePhotoURL: string | ''
}

export interface DeleteCompanyMasterRequest {
    CompanyId: number
    Uniquekey: string
}

export interface FilterWithPaginationCompanyMasterWithBankDetails {
    CompanyWithBankDetailsId?: number
    CompanyId?: number
    BeneficiaryAccountHolderName?: string
    AccountNumber?: string
    BankName?: string
    IsCheckPermission?: boolean
}

export interface CompanyMasterWithBankDetails {
    CompanyWithBankDetailsId: number | 0;
    CompanyId: number | 0;
    Uniquekey: string | '';
    CompanyName: string | '';
    BeneficiaryAccountHolderName: string | '';
    BankListMasterId: number | 0;
    BankName: string | '';
    AccountNumber: string | '';
    Branch: string | '';
    IFSCCode: string | '';
    AcType: string | '';
    NatureOfAccount: string | '';
    Status: string | '';
    MICRCode: string | '';
    CancelChequeURL: string | '';
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateCompanyMasterWithBankDetailsRequest {
    CompanyWithBankDetailsId: number | 0;
    CompanyId: number | 0;
    Uniquekey: string | '';
    BeneficiaryAccountHolderName: string | '';
    BankListMasterId: number | 0;
    AccountNumber: string | '';
    Branch: string | '';
    IFSCCode: string | '';
    AcType: string | '';
    NatureOfAccount: string | '';
    Status: string | '';
    MICRCode: string | '';
    CancelChequeURL: File[] | null;
    RemoveCancelChequeURLURL: string | '';
}

export interface DeleteCompanyMasterWithBankDetailsRequest {
    CompanyId: number | 0;
    CompanyWithBankDetailsId: number | 0;
    Uniquekey: string | '';
}

export type CompanyMasterListResponse = ApiResponse<CompanyMasterData[]>;
export type CompanyMasterSaveResponse = ApiResponse<CompanyMasterData[]>;
export type CompanyMasterDeleteResponse = ApiResponse<number>;
export type CompanyMasterWithBankDetailsListResponse = ApiResponse<CompanyMasterWithBankDetails[]>;
export type CompanyMasterWithBankDetailsSaveResponse = ApiResponse<CompanyMasterWithBankDetails[]>;
export type CompanyMasterWithBankDetailsDeleteResponse = ApiResponse<number>;
