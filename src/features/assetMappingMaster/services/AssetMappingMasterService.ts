import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationAssetMappingMasterRequest,
    AddUpdateAssetMappingMasterRequest,
    DeleteAssetMappingMasterRequest,
    AssetMappingMasterListResponse,
    AssetMappingMasterSaveResponse,
    AssetMappingMasterDeleteResponse
} from '@/features/assetMappingMaster/models/AssetMappingMasterModel'
import * as E from 'fp-ts/Either';
import { AssetMappingMasterDatasourceImpl } from '@/features/assetMappingMaster/datasources/AssetMappingMasterDatasource';

const assetMappingMasterDatasource = new AssetMappingMasterDatasourceImpl();

export const assetMappingMasterService = {

    apiCallPullAssetMappingMaster: async (params: FilterWithPaginationAssetMappingMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AssetMappingMasterListResponse>> => {
        try {

            return E.right(await assetMappingMasterDatasource.pullAssetMappingMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateAssetMappingMaster: async (params: AddUpdateAssetMappingMasterRequest): Promise<E.Either<Failure, AssetMappingMasterSaveResponse>> => {
        try {

            return E.right(await assetMappingMasterDatasource.addUpdateAssetMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteAssetMappingMaster: async (params: DeleteAssetMappingMasterRequest): Promise<E.Either<Failure, AssetMappingMasterDeleteResponse>> => {
        try {

            return E.right(await assetMappingMasterDatasource.deleteAssetMappingMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
