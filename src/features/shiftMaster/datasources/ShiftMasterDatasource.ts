import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ShiftMasterApi } from '@/features/shiftMaster/api/ShiftMasterApi'
import type {
    FilterWithPaginationShiftMasterRequest,
    AddUpdateShiftMasterRequest,
    DeleteShiftMasterRequest,
    ShiftMasterListResponse,
    ShiftMasterSaveResponse,
    ShiftMasterDeleteResponse
} from '@/features/shiftMaster/models/ShiftMasterModel'

export abstract class ShiftMasterDatasource {

    abstract pullShiftMaster(params: FilterWithPaginationShiftMasterRequest, signal?: AbortSignal): Promise<ShiftMasterListResponse>;
    abstract addUpdateShiftMaster(data: AddUpdateShiftMasterRequest): Promise<ShiftMasterSaveResponse>;
    abstract deleteShiftMaster(params: DeleteShiftMasterRequest): Promise<ShiftMasterDeleteResponse>;
}

export class ShiftMasterDatasourceImpl implements ShiftMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullShiftMaster(params: FilterWithPaginationShiftMasterRequest, signal?: AbortSignal): Promise<ShiftMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ShiftManagementMasterId) queryParams.append('ShiftManagementMasterId', params.ShiftManagementMasterId.toString());
            if (params.ShiftName?.trim()) queryParams.append('ShiftName', params.ShiftName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ShiftMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL SHIFT MASTER :', error);

           if (error instanceof TokenExpiredException) {

                return await this.pullShiftMaster(params);
            }

            throw error
        }
    }

    async addUpdateShiftMaster(params: AddUpdateShiftMasterRequest): Promise<ShiftMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ShiftMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE SHIFT MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateShiftMaster(params);
            }
            throw error
        }
    }

    async deleteShiftMaster(params: DeleteShiftMasterRequest): Promise<ShiftMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ShiftManagementMasterId: (params.ShiftManagementMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ShiftMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE SHIFT MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteShiftMaster(params);

            }

            throw error
        }
    }
}
