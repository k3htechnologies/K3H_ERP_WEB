import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AssetMasterApi } from '@/features/assetMaster/api/AssetMasterApi'
import type {
    FilterWithPaginationAssetMasterRequest,
    DeleteAssetMasterRequest,
    AssetMasterListResponse,
    AssetMasterSaveResponse,
    AssetMasterDeleteResponse
} from '@/features/assetMaster/models/AssetMasterModel'

export abstract class AssetMasterDatasource {

    abstract pullAssetMaster(params: FilterWithPaginationAssetMasterRequest, signal?: AbortSignal): Promise<AssetMasterListResponse>;
    abstract addUpdateAssetMaster(data: FormData): Promise<AssetMasterSaveResponse>;
    abstract deleteAssetMaster(params: DeleteAssetMasterRequest): Promise<AssetMasterDeleteResponse>;
}

export class AssetMasterDatasourceImpl implements AssetMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullAssetMaster(params: FilterWithPaginationAssetMasterRequest, signal?: AbortSignal): Promise<AssetMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.AssetMasterId) queryParams.append('AssetMasterId', params.AssetMasterId.toString());
            if (params.AssetName?.trim()) queryParams.append('AssetName', params.AssetName.trim());
            if (params.AssetType?.trim()) queryParams.append('AssetType', params.AssetType.trim());
            if (params.AssetModel?.trim()) queryParams.append('AssetModel', params.AssetModel.trim());
            if (params.AssetBrand?.trim()) queryParams.append('AssetBrand', params.AssetBrand.trim());
            if (params.SerialNumber?.trim()) queryParams.append('SerialNumber', params.SerialNumber.trim());
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AssetMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ASSET MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullAssetMaster(params);
            }
            throw error
        }
    }

    async addUpdateAssetMaster(params: FormData): Promise<AssetMasterSaveResponse> {

        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                AssetMasterApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE ASSET MASTER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateAssetMaster(params);
            }
            throw error
        }
    }

    async deleteAssetMaster(params: DeleteAssetMasterRequest): Promise<AssetMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                AssetMasterId: (params.AssetMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${AssetMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE ASSET MASTER :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteAssetMaster(params);

            }

            throw error
        }
    }
}
