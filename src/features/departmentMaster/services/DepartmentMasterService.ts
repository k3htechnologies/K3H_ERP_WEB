import type { ApiResponse } from '../../../core/api/ApiResponse';
import type { Failure } from '../../../core/api/FailureResponse';
import { DepartmentMasterDatasourceImpl } from '../datasources/DepartmentMasterDatasource'
import type {
    FilterWithPaginationDepartmentMasterRequest,
    AddUpdateDepartmentMasterRequest,
    DeleteDepartmentMasterRequest,
    DepartmentMasterData
} from '../models/DepartmentMasterModel';

import * as E from 'fp-ts/Either';

const departmentMasterDatasource = new DepartmentMasterDatasourceImpl();

export const departmentMasterService = {

    apiCallPullDepartmentMaster: async (params: FilterWithPaginationDepartmentMasterRequest): Promise<E.Either<Failure, ApiResponse<DepartmentMasterData>>> => {
        try {

            return E.right(await departmentMasterDatasource.pullDepartmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDepartmentMaster: async (data: AddUpdateDepartmentMasterRequest): Promise<E.Either<Failure, ApiResponse<DepartmentMasterData>>> => {
        try {

            return E.right(await departmentMasterDatasource.addUpdateDepartmentMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDepartmentMaster: async (params: DeleteDepartmentMasterRequest): Promise<E.Either<Failure, ApiResponse<number>>> => {
        try {

            return E.right(await departmentMasterDatasource.deleteDepartmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
