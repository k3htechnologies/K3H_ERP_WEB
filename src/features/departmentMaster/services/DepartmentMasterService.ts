import type { Failure } from '@/core/api/FailureResponse';
import { DepartmentMasterDatasourceImpl } from '@/features/departmentMaster/datasources/DepartmentMasterDatasource'
import type {
    FilterWithPaginationDepartmentMasterRequest,
    AddUpdateDepartmentMasterRequest,
    DeleteDepartmentMasterRequest,
    DepartmentMasterListResponse,
    DepartmentMasterSaveResponse,
    DepartmentMasterDeleteResponse
} from '@/features/departmentMaster/models/DepartmentMasterModel';

import * as E from 'fp-ts/Either';

const departmentMasterDatasource = new DepartmentMasterDatasourceImpl();

export const departmentMasterService = {

    apiCallPullDepartmentMaster: async (params: FilterWithPaginationDepartmentMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DepartmentMasterListResponse>> => {
        try {

            return E.right(await departmentMasterDatasource.pullDepartmentMaster(params, options?.signal));

        } catch (error: any) {

            if (error?.name === 'AbortError') {
                
                return E.left({ message: 'Request aborted', code: 'ABORTED' })
            }

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDepartmentMaster: async (params: AddUpdateDepartmentMasterRequest): Promise<E.Either<Failure, DepartmentMasterSaveResponse>> => {
        try {

            return E.right(await departmentMasterDatasource.addUpdateDepartmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDepartmentMaster: async (params: DeleteDepartmentMasterRequest): Promise<E.Either<Failure, DepartmentMasterDeleteResponse>> => {
        try {

            return E.right(await departmentMasterDatasource.deleteDepartmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
