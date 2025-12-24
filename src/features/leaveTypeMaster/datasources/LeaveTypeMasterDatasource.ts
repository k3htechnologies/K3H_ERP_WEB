import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { LeaveTypeMasterApi } from '@/features/leaveTypeMaster/api/LeaveTypeMasterApi'
import type {
    FilterWithPaginationLeaveTypeMasterRequest,
    AddUpdateLeaveTypeMasterRequest,
    DeleteLeaveTypeMasterRequest,
    LeaveTypeMasterListResponse,
    LeaveTypeMasterSaveResponse,
    LeaveTypeMasterDeleteResponse
} from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel'

export abstract class LeaveTypeMasterDatasource {

    abstract pullLeaveTypeMaster(params: FilterWithPaginationLeaveTypeMasterRequest, signal?: AbortSignal): Promise<LeaveTypeMasterListResponse>;
    abstract addUpdateLeaveTypeMaster(data: AddUpdateLeaveTypeMasterRequest): Promise<LeaveTypeMasterSaveResponse>;
    abstract deleteLeaveTypeMaster(params: DeleteLeaveTypeMasterRequest): Promise<LeaveTypeMasterDeleteResponse>;
}

export class LeaveTypeMasterDatasourceImpl implements LeaveTypeMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullLeaveTypeMaster(params: FilterWithPaginationLeaveTypeMasterRequest, signal?: AbortSignal): Promise<LeaveTypeMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LeaveTypeMasterId) queryParams.append('LeaveTypeMasterId', params.LeaveTypeMasterId.toString());
            if (params.LeaveType?.trim()) queryParams.append('LeaveType', params.LeaveType.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveTypeMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LEAVE TYPE MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullLeaveTypeMaster(params);
            }

            throw error
        }
    }

    async addUpdateLeaveTypeMaster(params: AddUpdateLeaveTypeMasterRequest): Promise<LeaveTypeMasterSaveResponse> {

        try {

            const payLoad: AddUpdateLeaveTypeMasterRequest = {
                LeaveTypeMasterId: params.LeaveTypeMasterId ?? 0,
                Uniquekey: params.Uniquekey ?? '',

                LeaveType: params.LeaveType?.trim() ?? '',
                LeaveTypeCode: params.LeaveTypeCode?.trim() ?? '',

                IsCarryForward: params.IsCarryForward ?? false,
                MaxCarryForward: params.MaxCarryForward ?? 0,
                IsEncashable: params.IsEncashable ?? false,
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LeaveTypeMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE LEAVE TYPE MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateLeaveTypeMaster(params);
            }
            throw error
        }
    }

    async deleteLeaveTypeMaster(params: DeleteLeaveTypeMasterRequest): Promise<LeaveTypeMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LeaveTypeMasterId: (params.LeaveTypeMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LeaveTypeMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LEAVE TYPE MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteLeaveTypeMaster(params);

            }

            throw error
        }
    }
}
