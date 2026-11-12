import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationClientLoanReport {
    PageSize: number;
    PageNumber: number;
    ProjectName: string | null;
    ProjectId: number;
    ApplicantName: string | null;
    ApplicantMobileNumber: string | null;
    Wing: string;
    Flat: string;
    Floor: string;
    Configuration: string;
    AgreementValue?: number;
    BankStatusClosedActive: string;
    SortBy?: string
    ExportType?: "Excel" | "PDF";
}

export interface ClientLoanReportData {
    ProjectName: string;
    SystemGeneratedCode: string;
    ApplicantName: string;
    ApplicantMobileNumber: string;
    BuildingNumber: string;
    Wing: string;
    Floor: string;
    Flat: string;
    FlatType: string;
    RERACarpetAreaSqFt: string;
    FlatConfiguration: string;
    AgreementValue: string;
    AgreemnentValueTDS: string;
    LoanSanctionAmount: string;
    BankName: string;
    LoanAccountNumber: string;
    LoanSanctionDate: string;
    BankBranchName: string;
    Address: string;
    BankStatusClosedAction: string;
}

export type ClientLoanReportResponse = ApiResponse<ClientLoanReportData[]>


