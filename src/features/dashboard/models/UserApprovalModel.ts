import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationUserApprovalRequest {
    ExportType?: 'Excel' | 'PDF'

}

export interface UserApprovalDashboardData {
    ModuleName: string | null;
    ProjectName: string | null;
    BuildingNumber: string | null;
    Wing: string | null;
    Floor: string | null;
    Flat: string | null;
    ApplicantName: string | null;
    ProjectDocumentName: string | null;
    ProjectDocumentCategory: string | null;
    NameOfInstitutionBankNBFC: string | null;
    ModulePath: string | null;
    SystemGeneratedCode: string | null;
}


export type UserApprovalDashboardListResponse = ApiResponse<UserApprovalDashboardData[]>;