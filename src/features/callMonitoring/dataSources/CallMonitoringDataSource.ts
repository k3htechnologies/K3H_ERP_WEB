import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import type { AddCallMonitoring, CallMonitoringDeleteResponse, CallMonitoringListResponse, CallMonitoringSaveResponse, CallMonitoringUpdateResponse, DeleteCallMonitoring, FilterWithPaginationCallMonitoring, UpdateCallMonitoring } from "@/features/callMonitoring/models/CallMonitoringModel";
import { CallMonitoringApi } from "@/features/callMonitoring/api/CallMonitoringApi";

export abstract class CallMonitoringDatasource {
    abstract pullCallMonitoring(params: FilterWithPaginationCallMonitoring, signal?: AbortSignal): Promise<CallMonitoringListResponse>;
    abstract addCallMonitoring(data: AddCallMonitoring): Promise<CallMonitoringSaveResponse>;
    abstract updateCallMonitoring(data: UpdateCallMonitoring): Promise<CallMonitoringUpdateResponse>;
    abstract deleteCallMonitoring(params: DeleteCallMonitoring): Promise<CallMonitoringDeleteResponse>;
}

export class CallMonitoringDatasourceImpl implements CallMonitoringDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullCallMonitoring(params: FilterWithPaginationCallMonitoring, signal?: AbortSignal): Promise<CallMonitoringListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            });

            if (params.CallMonitoringId) queryParams.append("CallMonitoringId", params.CallMonitoringId.toString());
            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.PageName) queryParams.append("PageName", params.PageName);
            if (params.Id) queryParams.append("Id", params.Id.toString());
            if (params.CallPurpose) queryParams.append("CallPurpose", params.CallPurpose.trim());
            if (params.CallStatus) queryParams.append("CallStatus", params.CallStatus.trim());
            if (params.MobileNumber) queryParams.append("MobileNumber", params.MobileNumber)
            if (params.Name) queryParams.append('Name', params.Name.trim());
            if (params.RescheduleDateFromDate) queryParams.append('RescheduleDateFromDate', params.RescheduleDateFromDate.toString());
            if (params.RescheduleDateToDate) queryParams.append('RescheduleDateToDate', params.RescheduleDateToDate.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CallMonitoringApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CALL MONITORING :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullCallMonitoring(params);
            }
            throw error
        }
    }

    async addCallMonitoring(data: AddCallMonitoring): Promise<CallMonitoringSaveResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallMonitoringApi.ADD,
                data
            )
            return response

        } catch (error: any) {

            console.error("ERROR: ADD CALL MONITORING :", error);

            if (error instanceof TokenExpiredException) {

                return await this.addCallMonitoring(data);
            }
            throw error
        }
    }

    async updateCallMonitoring(data: UpdateCallMonitoring): Promise<CallMonitoringUpdateResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallMonitoringApi.UPDATE,
                data
            )
            return response

        } catch (error: any) {

            console.error("ERROR: UPDATE CALL MONITORING :", error);

            if (error instanceof TokenExpiredException) {

                return await this.updateCallMonitoring(data);
            }
            throw error
        }
    }

    async deleteCallMonitoring(params: DeleteCallMonitoring): Promise<CallMonitoringDeleteResponse> {

        try {
            const queryParams = new URLSearchParams({
                CallMonitoringId: (params.CallMonitoringId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? ""
            });

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${CallMonitoringApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error: any) {

            console.error("ERROR: DELETE CALL MONITORING :", error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteCallMonitoring(params);
            }
            throw error
        }
    }
}