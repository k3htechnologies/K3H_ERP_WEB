import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { IbmObmReportApi } from '@/features/ibmObmReport/api/IbmObmReportApi';
import type { FilterWithPaginationIbmObmReportRequest, IbmObmReportResponse } from '@/features/ibmObmReport/models/IbmObmReportModel';

export abstract class IbmObmReportDatasource {

    abstract pullIbmObmReport(params: FilterWithPaginationIbmObmReportRequest): Promise<IbmObmReportResponse>;
}

export class IbmObmReportDatasourceImpl implements IbmObmReportDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullIbmObmReport(params: FilterWithPaginationIbmObmReportRequest): Promise<IbmObmReportResponse> {

        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.DepartmentName) queryParams.append('DepartmentName', params.DepartmentName.toString());
            if (params.Stage?.trim()) queryParams.append('Stage', params.Stage.trim());
            if (params.Year) queryParams.append('Year', params.Year.toString());
            if (params.FromDate?.trim()) queryParams.append('FromDate', params.FromDate.trim());
            if (params.ToDate?.trim()) queryParams.append('ToDate', params.ToDate.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(`${IbmObmReportApi.PULL}?${queryParams.toString()}`)

            return response;

        } catch (error: any) {

            console.error('ERROR: PULL IBM OBM REPORT :', error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullIbmObmReport(params);
            }

            throw error
        }
    }

}
