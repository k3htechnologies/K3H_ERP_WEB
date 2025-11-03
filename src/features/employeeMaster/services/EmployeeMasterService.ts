import type { ApiResponse } from '../../../core/api/ApiResponse';
import type { Failure } from '../../../core/api/FailureResponse';
import { EmployeeMasterDatasourceImpl } from '../datasources/EmployeeMasterDatasource'
import type {
    FilterWithPaginationEmployeeMasterRequest,
    AddUpdateEmployeeMasterRequest,
    EmployeeMasterData
} from '../models/EmployeeMasterModel';

import * as E from 'fp-ts/Either';

const EmployeeMasterDatasource = new EmployeeMasterDatasourceImpl();

export const EmployeeMasterService = {

    apiCallPullEmployeeMaster: async (params: FilterWithPaginationEmployeeMasterRequest): Promise<E.Either<Failure, ApiResponse<EmployeeMasterData>>> => {
        try {

            return E.right(await EmployeeMasterDatasource.pullEmployeeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeMaster: async (data: AddUpdateEmployeeMasterRequest): Promise<E.Either<Failure, ApiResponse<EmployeeMasterData>>> => {
        try {

            return E.right(await EmployeeMasterDatasource.addUpdateEmployeeMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
