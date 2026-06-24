import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationTaxTrackerRequest {
    PageSize: number;
    PageNumber: number;
    GovernmentCompliance?: string;
    CompanyId?: number | 0;
    CompanyName?: string;
    TaxTrackerId?: number;
    NoticeSection?: string;
    FinancialYear?: string;
    NoticeStatus?: string;
    FromNoticeDate?: string | null;
    ToNoticeDate?: string | null;
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface TaxTrackerData {
    TaxTrackerId: number | 0;
    Uniquekey: string | null;
    GovernmentCompliance: string | null;
    CompanyId: number | 0;
    CompanyName: string | null;
    FinancialYear: string | null;
    ResponsiblePersonId: string | null;
    ResponsiblePerson: string | null;
    NoticeType: string | null;
    NoticeSectionMasterId: number | 0;
    NoticeSection: string | null;
    Authority: string | null;
    NoticeDate: string | null;
    DueDate: string | null;
    NoticeStatus: string | null;
    TaxTrackerDocumentDetailsData: TaxTrackerDocumentDetailsData[];
    IsDelete: boolean
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface TaxTrackerDocumentDetailsData {
    TaxTrackerDocumentId: number | null;
    Uniquekey: string | null;
    TaxTrackerId: number | 0;
    NoticeDocumentURL: string | null;
    NoticeDescription: string | null;
    OfficerName: string | null;
    OfficerAddress: string | null;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export interface AddUpdateTaxTrackerRequest {
    TaxTrackerId: number | 0;
    Uniquekey: string | null;
    GovernmentCompliance: string | null;
    CompanyId: number | 0;
    FinancialYear: string | '';
    ResponsiblePersonId: string | null;
    NoticeType: string | null;
    NoticeSectionMasterId: number | 0;
    Authority: string | null;
    NoticeDate: string | null;
    DueDate: string | null;
    NoticeStatus: string | null;
    NoticeDocumentURL: File[] | null;
    RemoveNoticeDocumentURL: string | null;
    OfficerName: string | null;
    OfficerAddress: string | null;
    NoticeDescription: string | null;
}

export interface DeleteTaxTrackerRequest {
    TaxTrackerId: number | 0;
    Uniquekey: string | null;
}

export type TaxTrackerListResponse = ApiResponse<TaxTrackerData[]>;
export type TaxTrackerSaveResponse = ApiResponse<TaxTrackerData[]>;
export type TaxTrackerDeleteResponse = ApiResponse<number[]>;







