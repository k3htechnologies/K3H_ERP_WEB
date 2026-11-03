import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ClientLoanReportApi } from '@/features/clientLoanReport/api/ClientLoanReportApi'
import type { FilterWithPaginationClientLoanReport, ClientLoanReportResponse } from '@/features/clientLoanReport/models/ClientLoanReportModel'


export abstract class ClientLoanReportDatasource {
    abstract pullClientLoanReport(params: FilterWithPaginationClientLoanReport, signal?: AbortSignal): Promise<ClientLoanReportResponse>
}

export class ClientLoanReportDatasourceImpl implements ClientLoanReportDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullClientLoanReport(params: FilterWithPaginationClientLoanReport, signal?: AbortSignal): Promise<ClientLoanReportResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectName) queryParams.append('ProjectName', params.ProjectName);
            if (params.ApplicantName) queryParams.append('ApplicantName', params.ApplicantName);
            if (params.ApplicantMobileNumber) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber);
            if (params.Wing) queryParams.append('Wing', params.Wing);
            if (params.Flat) queryParams.append('Flat', params.Flat);
            if (params.Floor) queryParams.append('Floor', params.Floor);
            if (params.Configuration) queryParams.append('Configuration', params.Configuration);
            if (params.AgreementValue) queryParams.append('AgreementValue', params.AgreementValue.toString());
            if (params.BankStatusClosedActive) queryParams.append('BankStatusClosedActive', params.BankStatusClosedActive);
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(`${ClientLoanReportApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error) {
            console.error('Error: PULL CLIENT LOAN REPORT:', error);

            if (error instanceof TokenExpiredException) {
                return await this.pullClientLoanReport(params, signal);
            }

            throw error
        }
    }

}