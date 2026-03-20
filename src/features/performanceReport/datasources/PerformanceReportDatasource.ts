
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {

    PerformanceReportClosingListResponse,
    FilterWithPaginationPerformanceReportRequest,
    PerformanceReportSourcingListResponse

} from "@/features/performanceReport/models/PerformanceReportModel";
import { PerformanceReportApi } from "@/features/performanceReport/api/PerformanceReportApi";

export abstract class PerformanceReportDatasource {

    abstract pullPerformanceReportClosing(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportClosingListResponse>;
    abstract pullPerformanceReportSourcing(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportSourcingListResponse>;
}

export class PerformanceReportDatasourceImpl implements PerformanceReportDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPerformanceReportClosing(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportClosingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.ReportType?.trim()) queryParams.append("ReportType", params.ReportType.trim());
            if (params.PeriodType?.trim()) queryParams.append("PeriodType", params.PeriodType.trim());

            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PerformanceReportApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PERFORMANCE REPORT :", error);

            if (error === TokenExpiredException) {

                await this.pullPerformanceReportClosing(params);
            }
            throw error;
        }
    }

    async pullPerformanceReportSourcing(params: FilterWithPaginationPerformanceReportRequest, signal?: AbortSignal): Promise<PerformanceReportSourcingListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.EmployeeName) queryParams.append('EmployeeName', params.EmployeeName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.ReportType?.trim()) queryParams.append("ReportType", params.ReportType.trim());
            if (params.PeriodType?.trim()) queryParams.append("PeriodType", params.PeriodType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PerformanceReportApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL PERFORMANCE REPORT :", error);

            if (error === TokenExpiredException) {

                await this.pullPerformanceReportSourcing(params);
            }
            throw error;
        }
    }
}
