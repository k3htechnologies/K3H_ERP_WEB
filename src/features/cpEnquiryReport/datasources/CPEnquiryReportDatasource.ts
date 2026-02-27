import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { CPEnquiryReportApi } from '@/features/cpEnquiryReport/api/CPEnquiryReportApi';
import type { CPEnquiryReportResponse, FilterWithPaginationCPEnquiryReportRequest } from '@/features/cpEnquiryReport/models/CPEnquiryReportModel';

export abstract class CPEnquiryReportDatasource {

    abstract pullCPEnquiryReport(params: FilterWithPaginationCPEnquiryReportRequest): Promise<CPEnquiryReportResponse>;
}

export class CPEnquiryReportDatasourceImpl implements CPEnquiryReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullCPEnquiryReport(params: FilterWithPaginationCPEnquiryReportRequest): Promise<CPEnquiryReportResponse> {

        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.ChannelPartnerName) queryParams.append('ChannelPartnerName', params.ChannelPartnerName.toString());
            if (params.Stage?.trim()) queryParams.append('Stage', params.Stage.trim());
            if (params.Year) queryParams.append('Year', params.Year.toString());
            if (params.FromDate?.trim()) queryParams.append('FromDate', params.FromDate.trim());
            if (params.ToDate?.trim()) queryParams.append('ToDate', params.ToDate.trim());


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${CPEnquiryReportApi.PULL}?${queryParams.toString()}`)

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL CHANNEL PARTNER ENQUIRY REPORT :', error);

            if (error === TokenExpiredException) {

                await this.pullCPEnquiryReport(params);
            }

            throw error
        }
    }

}
