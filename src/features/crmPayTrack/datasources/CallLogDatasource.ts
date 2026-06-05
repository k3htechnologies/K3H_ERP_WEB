
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
} from "@/features/crmPayTrack/models/CallLogModel";
import { CallLogApi } from "@/features/crmPayTrack/api/CallLogApi";

export abstract class CallLogDatasource {

    abstract pullPayTrackCallLog(params: FilterWithPaginationCallLogRequest, signal?: AbortSignal): Promise<CallLogListResponse>;
    abstract addPayTrackCallLog(data: AddCallLogRequest): Promise<CallLogListResponse>;
    abstract updatePayTrackCallLog(data: UpdateCallLogRequest): Promise<CallLogUpdateResponse>;
    abstract deletePayTrackCallLog(params: DeleteCallLogRequest): Promise<CallLogDeleteResponse>;
}

export class CallLogDatasourceImpl implements CallLogDatasource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPayTrackCallLog(params: FilterWithPaginationCallLogRequest, signal?: AbortSignal): Promise<CallLogListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: String(params.PageSize ?? 10),
                pageNumber: String(params.PageNumber ?? 1),
            });

            if (params.ProjectId) queryParams.append("ProjectId", params.ProjectId.toString());
            if (params.BookingId) queryParams.append("BookingId", params.BookingId.toString());
            if (params.PayTrackCallLogId) queryParams.append("PayTrackCallLogId", params.PayTrackCallLogId.toString());
            if (params.ApplicantName) queryParams.append('ApplicantName', params.ApplicantName.toString());
            if (params.ApplicantMobileNumber) queryParams.append('ApplicantMobileNumber', params.ApplicantMobileNumber.toString());
            if (params.RescheduleDateFromDate) queryParams.append('RescheduleDateFromDate', params.RescheduleDateFromDate.toString());
            if (params.RescheduleDateToDate) queryParams.append('RescheduleDateToDate', params.RescheduleDateToDate.toString());
            if (params.CallStatus) queryParams.append('CallStatus', params.CallStatus.toString());
            if (params.CallPurpose) queryParams.append('CallPurpose', params.CallPurpose.toString());
            if (params.SortBy?.trim()) queryParams.append("SortBy", params.SortBy.trim());
            if (params.ExportType) queryParams.append("ExportType", params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${CallLogApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response

        } catch (error: any) {

            console.error("ERROR: PULL CALL LOG :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullPayTrackCallLog(params);
            }
            throw error;
        }
    }

    async addPayTrackCallLog(params: AddCallLogRequest): Promise<CallLogListResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallLogApi.ADD,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD CALL LOG:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addPayTrackCallLog(params);
            }
            throw error
        }
    }

    async updatePayTrackCallLog(params: UpdateCallLogRequest): Promise<CallLogUpdateResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                CallLogApi.UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: UPDATE CALL LOG:', error)

            if (error instanceof TokenExpiredException) {

                return await this.updatePayTrackCallLog(params);
            }
            throw error
        }
    }

    async deletePayTrackCallLog(params: DeleteCallLogRequest): Promise<CallLogDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PayTrackCallLogId: (params.PayTrackCallLogId ?? 0).toString(),
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

                return await this.deletePayTrackCallLog(params);
            }
            throw error
        }
    }
}
