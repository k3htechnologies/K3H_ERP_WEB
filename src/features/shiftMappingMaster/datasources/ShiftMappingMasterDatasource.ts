import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ShiftMappingMasterApi } from '@/features/shiftMappingMaster/api/ShiftMappingMasterApi'
import type {
    FilterWithPaginationShiftMappingMasterRequest,
    AddUpdateShiftMappingMasterRequest,
    DeleteShiftMappingMasterRequest,
    ShiftMappingMasterListResponse,
    ShiftMappingMasterSaveResponse,
    ShiftMappingMasterDeleteResponse
} from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel'

export abstract class ShiftMappingMasterDatasource {

    abstract pullShiftMappingMaster(params: FilterWithPaginationShiftMappingMasterRequest, signal?: AbortSignal): Promise<ShiftMappingMasterListResponse>;
    abstract addUpdateShiftMappingMaster(data: AddUpdateShiftMappingMasterRequest): Promise<ShiftMappingMasterSaveResponse>;
    abstract deleteShiftMappingMaster(params: DeleteShiftMappingMasterRequest): Promise<ShiftMappingMasterDeleteResponse>;
}

export class ShiftMappingMasterDatasourceImpl implements ShiftMappingMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullShiftMappingMaster(params: FilterWithPaginationShiftMappingMasterRequest, signal?: AbortSignal): Promise<ShiftMappingMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.ShiftManagementMasterMappingId) queryParams.append('ShiftManagementMasterMappingId', params.ShiftManagementMasterMappingId.toString());
            if (params.ShiftName?.trim()) queryParams.append('ShiftName', params.ShiftName.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ShiftMappingMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL SHIFT MAPPING MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullShiftMappingMaster(params);
            }

            throw error
        }
    }

    async addUpdateShiftMappingMaster(params: AddUpdateShiftMappingMasterRequest): Promise<ShiftMappingMasterSaveResponse> {

        try {

            const payLoad: AddUpdateShiftMappingMasterRequest = {
                ShiftManagementMasterMappingId: params.ShiftManagementMasterMappingId ?? 0,
                Uniquekey: params.Uniquekey ?? '',

                ShiftManagementMasterId: params.ShiftManagementMasterId ?? 0,
                DepartmentMasterId: params.DepartmentMasterId ?? '',
                EmployeeId: params.EmployeeId ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ShiftMappingMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE SHIFT MAPPING MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateShiftMappingMaster(params);
            }
            throw error
        }
    }

    async deleteShiftMappingMaster(params: DeleteShiftMappingMasterRequest): Promise<ShiftMappingMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ShiftManagementMasterMappingId: (params.ShiftManagementMasterMappingId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ShiftMappingMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE SHIFT MAPPING MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteShiftMappingMaster(params);

            }

            throw error
        }
    }
}
