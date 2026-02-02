import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { CallTrackerListResponse, FilterWithPaginationCallTrackerRequest } from "@/features/callTracker/models/CallTrackerModel";
import { CallTrackerApi } from "@/features/callTracker/api/CallTrackerApi";


export abstract class CallTrackerDatasource {

    abstract pullCallTracker(params: FilterWithPaginationCallTrackerRequest, signal?: AbortSignal): Promise<CallTrackerListResponse>;
}

export class CallTrackerDatasourceImpl implements CallTrackerDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }
//changes
    async pullCallTracker(params: FilterWithPaginationCallTrackerRequest, signal?: AbortSignal): Promise<CallTrackerListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber.toString());
            if (params.Name?.trim()) queryParams.append("Name", params.Name.trim());
            if (params.FromDate) queryParams.append('FromDate', params.FromDate.toString());
            if (params.ToDate) queryParams.append('ToDate', params.ToDate.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CallTrackerApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CALL TRACKER :", error);

            if (error === TokenExpiredException) {

                await this.pullCallTracker(params);
            }
            throw error;
        }
    }

}
