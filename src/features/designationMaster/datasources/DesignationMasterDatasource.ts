import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { DesignationMasterApi } from '@/features/designationMaster/api/DesignationMasterApi'
import type {
    FilterWithPaginationDesignationMasterRequest,
    AddUpdateDesignationMasterRequest,
    DeleteDesignationMasterRequest,
    DesignationMasterListResponse,
    DesignationMasterDeleteResponse
} from '@/features/designationMaster/models/DesignationMasterModel'

export abstract class DesignationMasterDatasource {

    abstract pullDesignationMaster(params: FilterWithPaginationDesignationMasterRequest, signal?: AbortSignal): Promise<DesignationMasterListResponse>;
    abstract addUpdateDesignationMaster(data: AddUpdateDesignationMasterRequest): Promise<DesignationMasterListResponse>;
    abstract deleteDesignationMaster(params: DeleteDesignationMasterRequest): Promise<DesignationMasterDeleteResponse>;
}

export class DesignationMasterDatasourceImpl implements DesignationMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullDesignationMaster(params: FilterWithPaginationDesignationMasterRequest, signal?: AbortSignal): Promise<DesignationMasterListResponse> {
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
                `${DesignationMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )

            return response
        } catch (error) {

            console.error('ERROR: PULL  DESIGNATION MASTER:', error);

            if (error === TokenExpiredException) {

                await this.pullDesignationMaster(params);

            }
            throw error
        }
    }

    async addUpdateDesignationMaster(params: AddUpdateDesignationMasterRequest): Promise<DesignationMasterListResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DesignationMasterApi.ADD_UPDATE,
                params
            )

            return response;

        } catch (error) {

            console.error('ERROR: ADD UPDATE DESIGNATION MASTER:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateDesignationMaster(params);
            }

            throw error
        }
    }

    async deleteDesignationMaster(params: DeleteDesignationMasterRequest): Promise<DesignationMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DesignationMasterId: (params.DesignationMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DesignationMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE DESIGNATION MASTER:', error)

            if (error === TokenExpiredException) {
                await this.deleteDesignationMaster(params);
            }

            throw error
        }
    }
}
