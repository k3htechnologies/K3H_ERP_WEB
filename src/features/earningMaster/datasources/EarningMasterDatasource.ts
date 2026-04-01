import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EarningMasterApi } from '@/features/earningMaster/api/EarningMasterApi'
import type {
    FilterWithPaginationEarningMasterRequest,
    AddUpdateEarningMasterRequest,
    DeleteEarningMasterRequest,
    EarningMasterListResponse,
    EarningMasterSaveResponse,
    EarningMasterDeleteResponse
} from '@/features/earningMaster/models/EarningMasterModel'

export abstract class EarningMasterDatasource {

    abstract pullEarningMaster(params: FilterWithPaginationEarningMasterRequest, signal?: AbortSignal): Promise<EarningMasterListResponse>;
    abstract addUpdateEarningMaster(data: AddUpdateEarningMasterRequest): Promise<EarningMasterSaveResponse>;
    abstract deleteEarningMaster(params: DeleteEarningMasterRequest): Promise<EarningMasterDeleteResponse>;
}

export class EarningMasterDatasourceImpl implements EarningMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullEarningMaster(params: FilterWithPaginationEarningMasterRequest, signal?: AbortSignal): Promise<EarningMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.EarningMasterId) queryParams.append('EarningMasterId', params.EarningMasterId.toString());
            if (params.Name?.trim()) queryParams.append('Name', params.Name.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EarningMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL EARNING MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullEarningMaster(params);
            }

            throw error
        }
    }

    async addUpdateEarningMaster(params: AddUpdateEarningMasterRequest): Promise<EarningMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EarningMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE EARNING MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return  await this.addUpdateEarningMaster(params);
            }
            throw error
        }
    }

    async deleteEarningMaster(params: DeleteEarningMasterRequest): Promise<EarningMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EarningMasterId: (params.EarningMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EarningMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE EARNING MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return   await this.deleteEarningMaster(params);

            }

            throw error
        }
    }
}
