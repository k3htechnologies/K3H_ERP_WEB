
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    PerformanceReportListResponse,
    FilterWithPaginationPerformanceReportRequest

} from "@/features/performanceReport/models/PerformanceReportModel";
import { PerformanceReportApi } from "@/features/performanceReport/api/PerformanceReportApi";

export abstract class PerformanceReportDatasource {

    abstract pullPerformanceReport(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportListResponse>;

}

export class PerformanceReportDatasourceImpl implements PerformanceReportDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPerformanceReport(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PerformanceReportApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PERFORMANCE REPORT :", error);

            if (error === TokenExpiredException) {

                await this.pullPerformanceReport(params);
            }
            throw error;
        }
    }
}
