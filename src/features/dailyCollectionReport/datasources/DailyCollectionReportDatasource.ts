import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { FilterWithPaginationDailyCollectionReportModel, DailyCollectionReportListResponse } from "@/features/dailyCollectionReport/models/DailyCollectionReportModel";
import { DailyCollectionReportApi } from "@/features/dailyCollectionReport/api/DailyCollectionReportApi";

export abstract class DailyCollectionReportDatasource {
    abstract pullDailyCollectionReport(params: FilterWithPaginationDailyCollectionReportModel, signal?: AbortSignal): Promise<DailyCollectionReportListResponse>;
}

export class DailyCollectionReportDatasourceImpl implements DailyCollectionReportDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullDailyCollectionReport(params: FilterWithPaginationDailyCollectionReportModel, signal?: AbortSignal): Promise<DailyCollectionReportListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 20),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.ProjectName) queryParams.append("ProjectName", params.ProjectName.toString());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.FilterType?.trim()) queryParams.append("FilterType", params.FilterType.trim());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${DailyCollectionReportApi.PULL}?${queryParams.toString()}`, { signal }
            )

        } catch (error: any) {

            console.error("ERROR: PULL DAILY COLLECTION REPORT :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullDailyCollectionReport(params);
            }
            throw error;
        }
    }
}