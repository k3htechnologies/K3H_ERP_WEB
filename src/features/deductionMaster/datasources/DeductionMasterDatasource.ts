import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { DeductionMasterApi } from '@/features/deductionMaster/api/DeductionMasterApi'
import type {
    FilterWithPaginationDeductionMasterRequest,
    AddUpdateDeductionMasterRequest,
    DeleteDeductionMasterRequest,
    DeductionMasterListResponse,
    DeductionMasterSaveResponse,
    DeductionMasterDeleteResponse
} from '@/features/deductionMaster/models/DeductionMasterModel'

export abstract class DeductionMasterDatasource {

    abstract pullDeductionMaster(params: FilterWithPaginationDeductionMasterRequest, signal?: AbortSignal): Promise<DeductionMasterListResponse>;
    abstract addUpdateDeductionMaster(data: AddUpdateDeductionMasterRequest): Promise<DeductionMasterSaveResponse>;
    abstract deleteDeductionMaster(params: DeleteDeductionMasterRequest): Promise<DeductionMasterDeleteResponse>;
}

export class DeductionMasterDatasourceImpl implements DeductionMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullDeductionMaster(params: FilterWithPaginationDeductionMasterRequest, signal?: AbortSignal): Promise<DeductionMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                DeductionMasterId: (params.DeductionMasterId ?? 0).toString(),
                Name:params.Name?? '',
                SortBy:params.SortBy?? '',
                ExportType: params.ExportType ?? ''

             })

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${DeductionMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL DEDUCTION MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullDeductionMaster(params);
            }

            throw error
        }
    }

    async addUpdateDeductionMaster(params: AddUpdateDeductionMasterRequest): Promise<DeductionMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                DeductionMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE DEDUCTION MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateDeductionMaster(params);
            }
            throw error
        }
    }

    async deleteDeductionMaster(params: DeleteDeductionMasterRequest): Promise<DeductionMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                DeductionMasterId: (params.DeductionMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${DeductionMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE DEDUCTION MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteDeductionMaster(params);

            }

            throw error
        }
    }
}
