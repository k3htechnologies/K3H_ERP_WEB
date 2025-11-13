import type { Failure } from '@/core/api/FailureResponse';
import { DesignationMasterDatasourceImpl } from '@/features/designationMaster/datasources/DesignationMasterDatasource'
import type {
    FilterWithPaginationDesignationMasterRequest,
    AddUpdateDesignationMasterRequest,
    DeleteDesignationMasterRequest,
    DesignationMasterListResponse,
    DesignationMasterDeleteResponse
} from '@/features/designationMaster/models/DesignationMasterModel';

import * as E from 'fp-ts/Either';

const designationMasterDatasource = new DesignationMasterDatasourceImpl();

export const DesignationMasterService = {

    apiCallPullDesignationMaster: async (params: FilterWithPaginationDesignationMasterRequest): Promise<E.Either<Failure, DesignationMasterListResponse>> => {
        try {

            return E.right(await designationMasterDatasource.pullDesignationMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDesignationMaster: async (data: AddUpdateDesignationMasterRequest): Promise<E.Either<Failure, DesignationMasterListResponse>> => {
        try {

            return E.right(await designationMasterDatasource.addUpdateDesignationMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDesignationMaster: async (params: DeleteDesignationMasterRequest): Promise<E.Either<Failure, DesignationMasterDeleteResponse>> => {
        try {

            return E.right(await designationMasterDatasource.deleteDesignationMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
