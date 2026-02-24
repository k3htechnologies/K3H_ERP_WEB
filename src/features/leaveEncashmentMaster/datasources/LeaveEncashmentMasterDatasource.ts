import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { LeaveEncashmentMasterApi } from '@/features/leaveEncashmentMaster/api/LeaveEncashmentMasterApi'
import type {
    FilterWithPaginationLeaveEncashmentMasterRequest,
    AddUpdateLeaveEncashmentMasterRequest,
    DeleteLeaveEncashmentMasterRequest,
    LeaveEncashmentMasterListResponse,
    LeaveEncashmentMasterSaveResponse,
    LeaveEncashmentMasterDeleteResponse
} from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel'

export abstract class LeaveEncashmentMasterDatasource {

    abstract pullLeaveEncashmentMaster(params: FilterWithPaginationLeaveEncashmentMasterRequest, signal?: AbortSignal): Promise<LeaveEncashmentMasterListResponse>;
    abstract addUpdateLeaveEncashmentMaster(data: AddUpdateLeaveEncashmentMasterRequest): Promise<LeaveEncashmentMasterSaveResponse>;
    abstract deleteLeaveEncashmentMaster(params: DeleteLeaveEncashmentMasterRequest): Promise<LeaveEncashmentMasterDeleteResponse>;
}

export class LeaveEncashmentMasterDatasourceImpl implements LeaveEncashmentMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullLeaveEncashmentMaster(params: FilterWithPaginationLeaveEncashmentMasterRequest, signal?: AbortSignal): Promise<LeaveEncashmentMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LeaveEncashmentMasterSlabsId) queryParams.append('LeaveEncashmentMasterSlabsId', params.LeaveEncashmentMasterSlabsId.toString());
            if (params.EarningName?.trim()) queryParams.append('EarningName', params.EarningName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveEncashmentMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL LEAVE ENCASHMENT MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullLeaveEncashmentMaster(params);
            }

            throw error
        }
    }

    async addUpdateLeaveEncashmentMaster(params: AddUpdateLeaveEncashmentMasterRequest): Promise<LeaveEncashmentMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                LeaveEncashmentMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE LEAVE ENCASHMENT MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateLeaveEncashmentMaster(params);
            }
            throw error
        }
    }

    async deleteLeaveEncashmentMaster(params: DeleteLeaveEncashmentMasterRequest): Promise<LeaveEncashmentMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LeaveEncashmentMasterSlabsId: (params.LeaveEncashmentMasterSlabsId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LeaveEncashmentMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE LEAVE ENCASHMENT MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteLeaveEncashmentMaster(params);

            }

            throw error
        }
    }
}
