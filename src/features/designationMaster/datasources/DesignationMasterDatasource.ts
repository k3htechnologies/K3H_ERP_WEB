import type { ApiResponse } from '../../../core/api/ApiResponse'
import baseClient from '../../../core/config/baseClient'
import { DesignationMasterApi } from '../api/DesignationMasterApi'
import type {
    FilterWithPaginationDesignationMasterRequest,
    AddUpdateDesignationMasterRequest,
    DeleteDesignationMasterRequest,
    DesignationMasterData
} from '../models/DesignationMasterModel'

export abstract class DesignationMasterDatasource {

    abstract pullDesignationMaster(params: FilterWithPaginationDesignationMasterRequest): Promise<ApiResponse<DesignationMasterData>>;
    abstract addUpdateDesignationMaster(data: AddUpdateDesignationMasterRequest): Promise<ApiResponse<DesignationMasterData>>;
    abstract deleteDesignationMaster(params: DeleteDesignationMasterRequest): Promise<ApiResponse<number>>;
}

export class DesignationMasterDatasourceImpl implements DesignationMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullDesignationMaster(params: FilterWithPaginationDesignationMasterRequest): Promise<ApiResponse<DesignationMasterData>> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.DesignationMasterId) queryParams.append('DesignationMasterId', params.DesignationMasterId.toString());
            if (params.DesignationName?.trim()) queryParams.append('DesignationName', params.DesignationName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DesignationMasterApi.PULL}?${queryParams.toString()}`
            )

            return response as ApiResponse<DesignationMasterData>
        } catch (error) {

            console.error('Error: Pull Designation Master:', error);
            throw error
        }
    }

    async addUpdateDesignationMaster(data: AddUpdateDesignationMasterRequest): Promise<ApiResponse<DesignationMasterData>> {

        try {

            const payLoad: AddUpdateDesignationMasterRequest = {
                DesignationMasterId: data.DesignationMasterId ?? 0,
                Uniquekey: data.Uniquekey ?? '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                DesignationName: data.DesignationName?.trim() ?? '',
                NoticePeriod: data.NoticePeriod ?? 0,
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DesignationMasterApi.ADD_UPDATE,
                payLoad
            )

            return response as ApiResponse<DesignationMasterData>
        } catch (error) {
            console.error('Error: Add Update Designation Master:', error)
            throw error
        }
    }

    async deleteDesignationMaster(params: DeleteDesignationMasterRequest): Promise<ApiResponse<number>> {
        try {
            const queryParams = new URLSearchParams({
                DesignationMasterId: (params.DesignationMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DesignationMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response as ApiResponse<number>;

        } catch (error) {

            console.error('❌ Error: Delete Designation Master:', error)
            throw error
        }
    }
}
