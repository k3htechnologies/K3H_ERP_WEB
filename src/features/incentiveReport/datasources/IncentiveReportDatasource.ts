import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { IncentiveReportApi } from '@/features/incentiveReport/api/IncentiveReportApi'
import type { FilterWithPaginationIncentiveReportRequest, IncentiveReportListResponse } from '@/features/incentiveReport/models/IncentiveReportModel'

export abstract class IncentiveReportDatasource {
    abstract pullIncentiveReport(params: FilterWithPaginationIncentiveReportRequest, signal?: AbortSignal): Promise<IncentiveReportListResponse>
    
}

export class IncentiveReportDatasourceImpl implements IncentiveReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullIncentiveReport(params: FilterWithPaginationIncentiveReportRequest, signal?: AbortSignal): Promise<IncentiveReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 20).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.BookingId) queryParams.append('BookingId', params.BookingId.toString());
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ApplicantMobileNumber?.trim()) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber.trim());
            if (params.ApplicantName?.trim()) queryParams.append('ApplicantName', params.ApplicantName.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.Wing?.trim()) queryParams.append('Wing', params.Wing.trim());
            if (params.Flat?.trim()) queryParams.append('Flat', params.Flat.trim());
            if (params.Floor?.trim()) queryParams.append('Floor', params.Floor.trim());
            if (params.Source) queryParams.append('Source', params.Source);
            if (params.SubSource) queryParams.append('SubSource', params.SubSource);
            if (params.SubSubSource) queryParams.append('SubSubSource', params.SubSubSource);
            if (params.AgreementValue) queryParams.append('AgreementValue', params.AgreementValue.toString());
            if (params.BookingType?.trim()) queryParams.append('BookingType', params.BookingType.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication( `${IncentiveReportApi.PULL_Incentive_REPORT}?${queryParams.toString()}`,{ signal })

            return response
        } catch (error) {
            console.error('Error: Pull INCENTIVE REPORT:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullIncentiveReport(params, signal);
            }

            throw error
        }
    }

}

