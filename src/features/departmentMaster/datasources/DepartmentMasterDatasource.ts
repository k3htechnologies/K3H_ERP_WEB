import type { ApiResponse } from '../../../core/api/ApiResponse'
import baseClient from '../../../core/config/baseClient'
import { DepartmentMasterApi } from '../api/DepartmentMasterApi'
import type {
    FilterWithPaginationDepartmentMasterRequest,
    AddUpdateDepartmentMasterRequest,
    DeleteDepartmentMasterRequest,
    DepartmentMasterData
} from '../models/DepartmentMasterModel'

export abstract class DepartmentMasterDatasource {

    abstract pullDepartmentMaster(params: FilterWithPaginationDepartmentMasterRequest): Promise<ApiResponse<DepartmentMasterData>>;
    abstract addUpdateDepartmentMaster(data: AddUpdateDepartmentMasterRequest): Promise<ApiResponse<DepartmentMasterData>>;
    abstract deleteDepartmentMaster(params: DeleteDepartmentMasterRequest): Promise<ApiResponse<number>>;
}

export class DepartmentMasterDatasourceImpl implements DepartmentMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullDepartmentMaster(params: FilterWithPaginationDepartmentMasterRequest): Promise<ApiResponse<DepartmentMasterData>> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.DepartmentCode?.trim()) queryParams.append('DepartmentCode', params.DepartmentCode.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DepartmentMasterApi.PULL}?${queryParams.toString()}`
            )

            return response as ApiResponse<DepartmentMasterData>
        } catch (error) {

            console.error('Error: Pull Department Master:', error);
            throw error
        }
    }

    async addUpdateDepartmentMaster(data: AddUpdateDepartmentMasterRequest): Promise<ApiResponse<DepartmentMasterData>> {

        try {

            const payLoad: AddUpdateDepartmentMasterRequest = {
                DepartmentMasterId: data.DepartmentMasterId ?? 0,
                Uniquekey: data.Uniquekey ?? '',
                DepartmentCode: data.DepartmentCode?.trim() ?? '',
                DepartmentName: data.DepartmentName?.trim() ?? '',
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DepartmentMasterApi.ADD_UPDATE,
                payLoad
            )

            return response as ApiResponse<DepartmentMasterData>
        } catch (error) {
            console.error('Error: Add Update Department Master:', error)
            throw error
        }
    }

    async deleteDepartmentMaster(params: DeleteDepartmentMasterRequest): Promise<ApiResponse<number>> {
        try {
            const queryParams = new URLSearchParams({
                DepartmentMasterId: (params.DepartmentMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DepartmentMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response as ApiResponse<number>;

        } catch (error) {

            console.error('❌ Error: DeleteDepartmentMaster:', error)
            throw error
        }
    }
}
