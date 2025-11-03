import type { ApiResponse } from '../../../core/api/ApiResponse';
import type { Failure } from '../../../core/api/FailureResponse';
import { DesignationMasterDatasourceImpl } from '../datasources/DesignationMasterDatasource'
import type {
    FilterWithPaginationDesignationMasterRequest,
    AddUpdateDesignationMasterRequest,
    DeleteDesignationMasterRequest,
    DesignationMasterData
} from '../models/DesignationMasterModel';

import * as E from 'fp-ts/Either';

const DesignationMasterDatasource = new DesignationMasterDatasourceImpl();

export const DesignationMasterService = {

    apiCallPullDesignationMaster: async (params: FilterWithPaginationDesignationMasterRequest): Promise<E.Either<Failure, ApiResponse<DesignationMasterData>>> => {
        try {

            return E.right(await DesignationMasterDatasource.pullDesignationMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDesignationMaster: async (data: AddUpdateDesignationMasterRequest): Promise<E.Either<Failure, ApiResponse<DesignationMasterData>>> => {
        try {

            return E.right(await DesignationMasterDatasource.addUpdateDesignationMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDesignationMaster: async (params: DeleteDesignationMasterRequest): Promise<E.Either<Failure, ApiResponse<number>>> => {
        try {

            return E.right(await DesignationMasterDatasource.deleteDesignationMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
