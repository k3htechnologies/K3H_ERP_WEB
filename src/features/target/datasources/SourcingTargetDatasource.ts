import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { SourcingTargetApi } from "@/features/target/api/SourcingTargetApi";
import type {
    SourcingTargetListResponse,
    FilterWithPaginationSourcingTargetRequest
} from "@/features/target/models/SourcingTargetModel";

export abstract class SourcingTargetDatasource {

    abstract pullSourcingTarget(params: FilterWithPaginationSourcingTargetRequest, signal?: AbortSignal): Promise<SourcingTargetListResponse>;
}

export class SourcingTargetDatasourceImpl implements SourcingTargetDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullSourcingTarget(params: FilterWithPaginationSourcingTargetRequest, signal?: AbortSignal): Promise<SourcingTargetListResponse> {
       
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
                `${SourcingTargetApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL SOURCING TARGET :", error);

            if (error instanceof TokenExpiredException) {
                return  await this.pullSourcingTarget(params);
            }
            throw error;
        }
    }

}
