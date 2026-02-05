import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationAssetMasterRequest,
    DeleteAssetMasterRequest,
    AssetMasterListResponse,
    AssetMasterSaveResponse,
    AssetMasterDeleteResponse
} from '@/features/assetMaster/models/AssetMasterModel'
import * as E from 'fp-ts/Either';
import { AssetMasterDatasourceImpl } from '@/features/assetMaster/datasources/AssetMasterDatasource';

const assetMasterDatasource = new AssetMasterDatasourceImpl();

export const assetMasterService = {

    apiCallPullAssetMaster: async (params: FilterWithPaginationAssetMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AssetMasterListResponse>> => {
        try {

            return E.right(await assetMasterDatasource.pullAssetMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateAssetMaster: async (params: FormData): Promise<E.Either<Failure, AssetMasterSaveResponse>> => {
        try {

            return E.right(await assetMasterDatasource.addUpdateAssetMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteAssetMaster: async (params: DeleteAssetMasterRequest): Promise<E.Either<Failure, AssetMasterDeleteResponse>> => {
        try {

            return E.right(await assetMasterDatasource.deleteAssetMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
