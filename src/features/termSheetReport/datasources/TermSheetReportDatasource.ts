import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import type { FilterWithPaginationTermSheetReportRequest, TermSheetReportListResponse } from '@/features/termSheetReport/models/TermSheetReportModel';
import { TermSheetReportApi } from '@/features/termSheetReport/api/TermSheetReportApi';

export abstract class TermSheetReportDatasource {
    abstract pullTermSheetReport(params: FilterWithPaginationTermSheetReportRequest, signal?: AbortSignal): Promise<TermSheetReportListResponse>
    
}

export class TermSheetReportDatasourceImpl implements TermSheetReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullTermSheetReport(params: FilterWithPaginationTermSheetReportRequest, signal?: AbortSignal): Promise<TermSheetReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString()
            })

            if (params.ApprovalStatus?.trim()) { queryParams.append('ApprovalStatus', params.ApprovalStatus.trim()) }
            if (params.ProjectId) { queryParams.append('ProjectId', params.ProjectId.toString()) }
            if (params.TermSheetId) { queryParams.append('TermSheetId', params.TermSheetId.toString()) }
            if (params.TermSheetDetailsId) { queryParams.append('TermSheetDetailsId', params.TermSheetDetailsId.toString()) }
            if (params.NameOfInstitutionBankNBFC?.trim()) { queryParams.append('NameOfInstitutionBankNBFC', params.NameOfInstitutionBankNBFC.trim()) }
            if (params.ProjectName?.trim()) { queryParams.append('ProjectName', params.ProjectName.trim()) }
            if (params.CompanyName?.trim()) { queryParams.append('CompanyName', params.CompanyName.trim()) }
            if (params.SortBy?.trim()) { queryParams.append('SortBy', params.SortBy.trim()) }
            if (params.ExportType) { queryParams.append('ExportType', params.ExportType) }

            const response = await this.k3hHttpClient.getRequestWithAuthentication( `${TermSheetReportApi.PULL_TERM_SHEET_REPORT}?${queryParams.toString()}`,{ signal })

            return response
        } catch (error) {
            console.error('Error: PULL TERM SHEET REPORT:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullTermSheetReport(params, signal);
            }

            throw error
        }
    }

}

