import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { CallingDataApi } from "@/features/callTracker/api/CallingDataApi";
import type {
    CallingDataListResponse,
    FilterWithPaginationCallingDataRequest
} from "@/features/callTracker/models/CallingDataModel";

export abstract class CallingDataDatasource {

    abstract pullCallingData(params: FilterWithPaginationCallingDataRequest, signal?: AbortSignal): Promise<CallingDataListResponse>;
}

export class CallingDataDatasourceImpl implements CallingDataDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCallingData(params: FilterWithPaginationCallingDataRequest, signal?: AbortSignal): Promise<CallingDataListResponse> {
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
                `${CallingDataApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CALLING DATA :", error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullCallingData(params);
            }
            throw error;
        }
    }

}
