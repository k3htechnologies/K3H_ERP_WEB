import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { ClosingTargetApi } from "@/features/target/api/ClosingTargetApi";
import type {
    ClosingTargetListResponse,
    FilterWithPaginationClosingTargetRequest
} from "@/features/target/models/ClosingTargetModel";

export abstract class ClosingTargetDatasource {

    abstract pullClosingTarget(params: FilterWithPaginationClosingTargetRequest, signal?: AbortSignal): Promise<ClosingTargetListResponse>;
}

export class ClosingTargetDatasourceImpl implements ClosingTargetDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullClosingTarget(params: FilterWithPaginationClosingTargetRequest, signal?: AbortSignal): Promise<ClosingTargetListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
                IsSampleDownload: (params.IsSampleDownload ?? false).toString(),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.EmployeeId) queryParams.append("EmployeeId", params.EmployeeId.toString());
            if (params.EmployeeName?.trim()) queryParams.append("EmployeeName", params.EmployeeName.trim());
            if (params.MonthYear) queryParams.append('MonthYear', params.MonthYear.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ClosingTargetApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CLOSING TARGET :", error);

            if (error === TokenExpiredException) {

                await this.pullClosingTarget(params);
            }
            throw error;
        }
    }

}
