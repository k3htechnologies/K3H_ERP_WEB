import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeMasterDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeMasterDatasource'
import type {
    FilterWithPaginationEmployeeMasterRequest,
    AddUpdateEmployeeMasterRequest,
    EmployeeMasterListResponse,

    LocationResponse
} from '../models/EmployeeMasterModel';

import * as E from 'fp-ts/Either';

const employeeMasterDatasource = new EmployeeMasterDatasourceImpl();

export const employeeMasterService = {

    apiCallPullLocationHierarchy: async (): Promise<E.Either<Failure, LocationResponse>> => {
        debugger
    try {
      const response = await employeeMasterDatasource.pullLocationHierarchy();
      return E.right(response);
    } catch (error: any) {
      return E.left({ message: error.message, code: error.code });
    }
  },
    apiCallPullEmployeeMaster: async (params: FilterWithPaginationEmployeeMasterRequest): Promise<E.Either<Failure, EmployeeMasterListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.pullEmployeeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeMaster: async (data: AddUpdateEmployeeMasterRequest): Promise<E.Either<Failure,EmployeeMasterListResponse>> => {
        try {

            return E.right(await employeeMasterDatasource.addUpdateEmployeeMaster(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
