import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { EmployeeModuleAccessDatasourceImpl } from '@/features/employeeModuleAccess/datasources/EmployeeModuleAccessDatasource';
import type { AddUpdateEmployeeModuleAccessRequest, EmployeeModuleAccessListResponse, EmployeeModuleAccessSaveResponse, PullEmployeeModuleAccessRequest } from '@/features/employeeModuleAccess/models/EmployeeModuleAccessModel';

const employeeModuleAccessDatasource = new EmployeeModuleAccessDatasourceImpl();

export const employeeModuleAccessService = {

    apiCallPullEmployeeModuleAccess: async (params: PullEmployeeModuleAccessRequest): Promise<E.Either<Failure, EmployeeModuleAccessListResponse>> => {
        try {

            return E.right(await employeeModuleAccessDatasource.pullEmployeeModuleAccess(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeModuleAccess: async (params: AddUpdateEmployeeModuleAccessRequest): Promise<E.Either<Failure, EmployeeModuleAccessSaveResponse>> => {
        try {

            return E.right(await employeeModuleAccessDatasource.addUpdateEmployeeModuleAccess(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
