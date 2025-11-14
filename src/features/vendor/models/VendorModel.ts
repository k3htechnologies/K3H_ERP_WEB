import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationVendorRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    VendorId?: number
    VendorName?: string
    CompanyName?: string
    CompanyType?: string
    MobileNumber?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface VendorData {
    VendorId: number | 0
    Uniquekey: string | null

    CompanyName: string | ''
    CompanyType: string | ''
    VendorName: string | ''
    MobileNumber: string | ''
    EmailId: string | ''
    AadharCardNumber: string | ''
    AadharCardURL: string | ''
    PanCardNumber: string | ''
    PanCardURL: string | ''
    GSTNumber: string | ''
    GSTCertificateURL: string | ''
    Address: string | ''

    CountryMasterId: number | 0
    CountryName: string | ''
    StateMasterId: number | 0
    StateName: string | ''
    DistrictMasterId: number | 0
    DistrictName: string | ''
    CityMasterId: number | 0
    CityName: string | ''

    AvailableMaterialList: string | ''
    AvailableContractList: string | ''

    IsApproval: boolean | false
    IsFinalized: boolean | false

    VendorFinalizationApproval: string | ''

    Message: string | ''
    TotalRecords: number | 0

    MaterialRequisitionQuotationTermsData: any[] | []
    SubMaterialMasterData: any[] | []
    ContractTypeMasterData: any[] | []

    MagicLinkURL: string | ''
    SystemGeneratedCode: string | ''
    ProjectName: string | ''
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateVendorRequest {
    VendorId: number | 0
    Uniquekey: string | null

    CompanyName: string | ''
    CompanyType: string | ''
    VendorName: string | ''
    MobileNumber: string | ''
    EmailId: string | ''
    AadharCardNumber: string | ''

    AadharCardURL: File[] | null
    RemoveAadharCardURL: string | ''

    PanCardNumber: string | ''
    PanCardURL: File[] | null
    RemovePanCardURL: string | ''

    GSTNumber: string | ''
    GSTCertificateURL: File[] | null
    RemoveGSTCertificateURL: string | ''

    Address: string | ''

    CountryMasterId: number | 0
    StateMasterId: number | 0
    DistrictMasterId: number | 0
    CityMasterId: number | 0

    AvailableMaterialList: string | ''
    AvailableContractList: string | ''

    MagicLinkUniquekey: string | null
    ClientRegistrationId: number | 0
}

export interface DeleteVendorRequest {
    VendorId: number
    UniqueKey: string
}

export type VendorListResponse = ApiResponse<VendorData[]>;
export type VendorSaveResponse = ApiResponse<VendorData[]>;
export type VendorDeleteResponse = ApiResponse<number>;
