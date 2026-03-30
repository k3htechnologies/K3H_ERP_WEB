
import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type {
    AddCallLogRequest,
    CallLogDeleteResponse,
    CallLogListResponse,
    CallLogUpdateResponse,
    DeleteCallLogRequest,
    FilterWithPaginationCallLogRequest,
    UpdateCallLogRequest
} from "@/features/callTracker/models/CallLogModel";
import { CallLogApi } from "@/features/callTracker/api/CallLogApi";

export abstract class CallLogDatasource {

    abstract pullCallLog(params: FilterWithPaginationCallLogRequest, signal?: AbortSignal): Promise<CallLogListResponse>;
    abstract addCallLog(data: AddCallLogRequest): Promise<CallLogListResponse>;
    abstract UpdateCallLog(data: UpdateCallLogRequest): Promise<CallLogUpdateResponse>;
    abstract deleteCallLog(params: DeleteCallLogRequest): Promise<CallLogDeleteResponse>;
}

export class CallLogDatasourceImpl implements CallLogDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCallLog(params: FilterWithPaginationCallLogRequest, signal?: AbortSignal): Promise<CallLogListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.CallLogId) queryParams.append("CallLogId", params.CallLogId.toString());
            if (params.Name) queryParams.append('Name', params.Name.toString());
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber.toString());
            if (params.RescheduleDateFromDate) queryParams.append('RescheduleDateFromDate', params.RescheduleDateFromDate.toString());
            if (params.RescheduleDateToDate) queryParams.append('RescheduleDateToDate', params.RescheduleDateToDate.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CallLogApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CALL LOG :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCallLog(params);
            }
            throw error;
        }
    }

    async addCallLog(params: AddCallLogRequest): Promise<CallLogListResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallLogApi.ADD,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD CALL LOG:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addCallLog(params);
            }
            throw error
        }
    }

    async UpdateCallLog(params: UpdateCallLogRequest): Promise<CallLogUpdateResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallLogApi.UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: UPDATE CALL LOG:', error)

            if (error instanceof TokenExpiredException) {

                return await this.UpdateCallLog(params);
            }
            throw error
        }
    }

    async deleteCallLog(params: DeleteCallLogRequest): Promise<CallLogDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                CallLogId: (params.CallLogId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CallLogApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE CALL LOG:', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteCallLog(params);
            }
            throw error
        }
    }
}
