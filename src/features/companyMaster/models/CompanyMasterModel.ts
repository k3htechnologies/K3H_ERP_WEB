import type { ApiResponse } from "../../../core/api/ApiResponse"

// ===========================
// 📄 Request for Filtering & Pagination
// ===========================
export interface FilterWithPaginationCompanyMasterRequest {
  PageSize: number
  PageNumber: number
  IsCheckPermission?: boolean
  CompanyMasterId?: number
  CompanyName?: string
  SortBy?: string
  ExportType?: "Excel" | "PDF"
}

// ===========================
// 🧱 Company Partner (Sub-Entity)
// ===========================
export interface CompanyPartnerData {
  CompanyPartnerId: number | 0
  CompanyMasterId: number | 0
  FirstName: string | ""
  MiddleName: string | ""
  LastName: string | ""
  DOB: string | null
  Gender: string | ""
  MobileNumber: string | ""
  EmailId: string | ""
  PartnerPercentage: number | 0
  PANNumber: string | ""
  PANUrl: string | ""
  AadharCardNumber: string | ""
  AadharCardUrl: string | ""
  PhotoUrl: string | ""
  CreatedById: number | 0
  CreatedBy: string | ""
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ""
  ModifiedDate: string | null
}

// ===========================
// 🧩 Main Company Master Data Model
// ===========================
export interface CompanyMasterData {
  CompanyMasterId: number | 0
  UniqueKey: string | ""
  CompanyName: string | ""
  CompanyType: string | ""
  ContactPerson: string | ""
  MobileNumber: string | ""
  EmailId: string | ""
  LandlineNumber: string | ""
  GSTNumber: string | ""
  GSTCertificateUrl: string | ""
  PANNumber: string | ""
  PANUrl: string | ""
  CINNumber: string | ""
  CINUrl: string | ""
  RERANumber: string | ""
  State: string | ""
  District: string | ""
  City: string | ""
  CompanyLetterheadHeaderType: "Text" | "Image" | "PDF" | ""
  CompanyLetterheadHeaderValue: string | ""
  CompanyLetterheadFooterType: "Text" | "Image" | "PDF" | ""
  CompanyLetterheadFooterValue: string | ""
  Partners: CompanyPartnerData[] | []
  CreatedById: number | 0
  CreatedBy: string | ""
  CreatedDate: string | null
  ModifiedById: number | 0
  ModifiedBy: string | ""
  ModifiedDate: string | null
  LastModifiedBy: string | ""
  LastModifiedDate: string | null
}

// ===========================
// ✏️ Add/Update Request
// ===========================
export interface AddUpdateCompanyMasterRequest {
  CompanyMasterId?: number
  UniqueKey?: string
  CompanyCode: string
  CompanyName: string
  CompanyType: string
  ContactPerson: string
  MobileNumber: string
  EmailId: string
  LandlineNumber?: string
  GSTNumber?: string
  GSTCertificateUrl?: string
  PANNumber?: string
  PANUrl?: string
  CINNumber?: string
  CINUrl?: string
  RERANumber?: string
  State: string
  District: string
  City: string
  CompanyLetterheadHeaderType: "Text" | "Image" | "PDF" | ""
  CompanyLetterheadHeaderValue: string
  CompanyLetterheadFooterType: "Text" | "Image" | "PDF" | ""
  CompanyLetterheadFooterValue: string
  Partners?: AddUpdateCompanyPartnerRequest[]
}

// ===========================
// ✏️ Add/Update Partner Request
// ===========================
export interface AddUpdateCompanyPartnerRequest {
  CompanyPartnerId?: number
  CompanyMasterId?: number
  FirstName: string
  MiddleName?: string
  LastName: string
  DOB?: string
  Gender?: string
  MobileNumber: string
  EmailId?: string
  PartnerPercentage: number
  PANNumber?: string
  PANUrl?: string
  AadharCardNumber?: string
  AadharCardUrl?: string
  PhotoUrl?: string
}

// ===========================
// 🗑️ Delete Requests
// ===========================
export interface DeleteCompanyMasterRequest {
  CompanyMasterId: number
  UniqueKey: string
}

export interface DeleteCompanyPartnerRequest {
  CompanyPartnerId: number
  CompanyMasterId: number
}

// ===========================
// 🔁 API Response Types
// ===========================
export type CompanyMasterListResponse = ApiResponse<CompanyMasterData[]>
export type CompanyMasterSaveResponse = ApiResponse<CompanyMasterData[]>
export type CompanyMasterDeleteResponse = ApiResponse<number>

export type CompanyPartnerListResponse = ApiResponse<CompanyPartnerData[]>
export type CompanyPartnerSaveResponse = ApiResponse<CompanyPartnerData[]>
export type CompanyPartnerDeleteResponse = ApiResponse<number>
