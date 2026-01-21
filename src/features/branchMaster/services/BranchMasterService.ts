import type { Failure } from '@/core/api/FailureResponse';
import { BranchMasterDatasourceImpl } from '@/features/branchMaster/datasources/BranchMasterDatasource'
import type {
    FilterWithPaginationBranchMasterRequest,
    AddUpdateBranchMasterRequest,
    DeleteBranchMasterRequest,
    BranchMasterListResponse,
    BranchMasterSaveResponse,
    BranchMasterDeleteResponse
} from '@/features/branchMaster/models/BranchMasterModel';

import * as E from 'fp-ts/Either';

const branchMasterDatasource = new BranchMasterDatasourceImpl();

export const branchMasterService = {

    apiCallPullBranchMaster: async (params: FilterWithPaginationBranchMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BranchMasterListResponse>> => {
        try {

            return E.right(await branchMasterDatasource.pullBranchMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBranchMaster: async (params: AddUpdateBranchMasterRequest): Promise<E.Either<Failure, BranchMasterSaveResponse>> => {
        try {

            return E.right(await branchMasterDatasource.addUpdateBranchMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBranchMaster: async (params: DeleteBranchMasterRequest): Promise<E.Either<Failure, BranchMasterDeleteResponse>> => {
        try {

            return E.right(await branchMasterDatasource.deleteBranchMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
