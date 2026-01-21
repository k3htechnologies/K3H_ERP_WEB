import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { BranchMasterApi } from '@/features/branchMaster/api/BranchMasterApi'
import type {
    FilterWithPaginationBranchMasterRequest,
    AddUpdateBranchMasterRequest,
    DeleteBranchMasterRequest,
    BranchMasterListResponse,
    BranchMasterSaveResponse,
    BranchMasterDeleteResponse
} from '@/features/branchMaster/models/BranchMasterModel'

export abstract class BranchMasterDatasource {

    abstract pullBranchMaster(params: FilterWithPaginationBranchMasterRequest, signal?: AbortSignal): Promise<BranchMasterListResponse>;
    abstract addUpdateBranchMaster(data: AddUpdateBranchMasterRequest): Promise<BranchMasterSaveResponse>;
    abstract deleteBranchMaster(params: DeleteBranchMasterRequest): Promise<BranchMasterDeleteResponse>;
}

export class BranchMasterDatasourceImpl implements BranchMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullBranchMaster(params: FilterWithPaginationBranchMasterRequest, signal?: AbortSignal): Promise<BranchMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.BranchMasterId) queryParams.append('BranchMasterId', params.BranchMasterId.toString());
            if (params.BranchName?.trim()) queryParams.append('BranchName', params.BranchName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${BranchMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL BRANCH MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullBranchMaster(params);
            }

            throw error
        }
    }

    async addUpdateBranchMaster(params: AddUpdateBranchMasterRequest): Promise<BranchMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                BranchMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE BRANCH MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateBranchMaster(params);
            }
            throw error
        }
    }

    async deleteBranchMaster(params: DeleteBranchMasterRequest): Promise<BranchMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                BranchMasterId: (params.BranchMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${BranchMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE BRANCH MASTER :', error)

            if (error === TokenExpiredException) {

                await this.deleteBranchMaster(params);

            }

            throw error
        }
    }
}
