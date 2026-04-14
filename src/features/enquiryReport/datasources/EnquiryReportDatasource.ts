import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EnquiryReportApi } from '@/features/enquiryReport/api/EnquiryReportApi';
import type { EnquiryReportResponse, FilterWithPaginationEnquiryReportRequest } from '@/features/enquiryReport/models/EnquiryReportModel';

export abstract class EnquiryReportDatasource {

    abstract pullEnquiryReport(params: FilterWithPaginationEnquiryReportRequest): Promise<EnquiryReportResponse>;
}

export class EnquiryReportDatasourceImpl implements EnquiryReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullEnquiryReport(params: FilterWithPaginationEnquiryReportRequest): Promise<EnquiryReportResponse> {

        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                DepartmentName: params.DepartmentName || 'Sales'
            })

            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.Stage?.trim()) queryParams.append('Stage', params.Stage.trim());
            if (params.Year) queryParams.append('Year', params.Year.toString());
            if (params.FromDate?.trim()) queryParams.append('FromDate', params.FromDate.trim());
            if (params.ToDate?.trim()) queryParams.append('ToDate', params.ToDate.trim());


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${EnquiryReportApi.PULL}?${queryParams.toString()}`)

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL ENQUIRY REPORT :', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullEnquiryReport(params);
            }

            throw error
        }
    }

}
