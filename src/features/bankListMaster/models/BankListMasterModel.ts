import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationBankListMasterRequest {
    PageSize: number
    PageNumber: number
    BankListMasterId?: number
    BankName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface BankListMasterData {
    BankListMasterId: number | 0
    BankNameWithCode: string | ''
}

export type BankListMasterListResponse = ApiResponse<BankListMasterData[]>;
