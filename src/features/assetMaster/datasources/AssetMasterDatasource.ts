import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AssetMasterApi } from '@/features/assetMaster/api/AssetMasterApi'
import type {
    FilterWithPaginationAssetMasterRequest,
    AddUpdateAssetMasterRequest,
    DeleteAssetMasterRequest,
    AssetMasterListResponse,
    AssetMasterSaveResponse,
    AssetMasterDeleteResponse
} from '@/features/assetMaster/models/AssetMasterModel'

export abstract class AssetMasterDatasource {

    abstract pullAssetMaster(params: FilterWithPaginationAssetMasterRequest, signal?: AbortSignal): Promise<AssetMasterListResponse>;
    abstract addUpdateAssetMaster(data: AddUpdateAssetMasterRequest): Promise<AssetMasterSaveResponse>;
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
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AssetMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ASSET MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullAssetMaster(params);
            }
            throw error
        }
    }

    async addUpdateAssetMaster(params: AddUpdateAssetMasterRequest): Promise<AssetMasterSaveResponse> {

        try {

            const payLoad: AddUpdateAssetMasterRequest = {
                AssetMasterId: params.AssetMasterId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                AssetCode: params.AssetCode?.trim() ?? '',
                AssetName: params.AssetName?.trim() ?? '',
                AssetType: params.AssetType?.trim() ?? '',
                AssetModel: params.AssetModel?.trim() ?? '',
                AssetBrand: params.AssetBrand?.trim() ?? '',
                SerialNumber: params.SerialNumber?.trim() ?? '',
                PurchaseDate: params.PurchaseDate ?? null,
                WarrantyExpiryDate: params.WarrantyExpiryDate ?? null,
                AssetCost: params.AssetCost ?? 0,
                SupplierName: params.SupplierName?.trim() ?? ''
            }


            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                AssetMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            
            console.error('ERROR: ADD UPDATE ASSET MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateAssetMaster(params);
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
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE ASSET MASTER :', error);

                await this.deleteAssetMaster(params);

            }

            throw error
        }
    }
}
