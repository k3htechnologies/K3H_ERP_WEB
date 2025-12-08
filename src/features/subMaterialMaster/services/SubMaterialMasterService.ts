import type { Failure } from '@/core/api/FailureResponse';
import { SubMaterialMasterDatasourceImpl } from '@/features/subMaterialMaster/datasources/SubMaterialMasterDatasource'
import type {
    AddUpdateSubMaterialMasterRequest,
    DeleteSubMaterialMasterRequest,
    SubMaterialMasterListResponse,
    SubMaterialMasterDeleteResponse,
    FilterWithPaginationSubMaterialMaster,
    SubMaterialMasterSaveReponse
} from '@/features/subMaterialMaster/models/SubMaterialMasterModel';

import * as E from 'fp-ts/Either';

const subMaterialMasterDatasource = new SubMaterialMasterDatasourceImpl();

export const subMaterialMasterService = {

    apiCallPullSubMaterialMaster: async (params: FilterWithPaginationSubMaterialMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SubMaterialMasterListResponse>> => {
        try {
            return E.right(await subMaterialMasterDatasource.pullSubMaterialMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateSubMaterialMaster: async (params: AddUpdateSubMaterialMasterRequest): Promise<E.Either<Failure, SubMaterialMasterSaveReponse>> => {
        try {

            return E.right(await subMaterialMasterDatasource.addUpdateSubMaterialMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteSubMaterialMaster: async (params: DeleteSubMaterialMasterRequest): Promise<E.Either<Failure, SubMaterialMasterDeleteResponse>> => {
        try {

            return E.right(await subMaterialMasterDatasource.deleteSubMaterialMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
