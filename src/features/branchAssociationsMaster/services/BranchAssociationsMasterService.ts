import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationBranchAssociationsMasterRequest,
    AddUpdateBranchAssociationsMasterRequest,
    BranchAssociationsMasterListResponse,
    BranchAssociationsMasterSaveResponse,
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel'
import * as E from 'fp-ts/Either';
import { BranchAssociationsMasterDatasourceImpl } from '@/features/branchAssociationsMaster/datasources/BranchAssociationsMasterDatasource';

const branchAssociationsMasterDatasource = new BranchAssociationsMasterDatasourceImpl();

export const branchAssociationsService = {

    apiCallPullBranchAssociations: async (params: FilterWithPaginationBranchAssociationsMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BranchAssociationsMasterListResponse>> => {
        try {

            return E.right(await branchAssociationsMasterDatasource.pullBranchAssociationsMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBranchAssociations: async (params: AddUpdateBranchAssociationsMasterRequest): Promise<E.Either<Failure, BranchAssociationsMasterSaveResponse>> => {
        try {

            return E.right(await branchAssociationsMasterDatasource.addUpdateBranchAssociationsMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}
