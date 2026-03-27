import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeResignationDatasourceImpl } from '@/features/resignation/datasources/EmployeeResignationDatasource'
import type {
    FilterWithPaginationEmployeeResignationRequest,
        DeleteEmployeeResignationRequest,
    EmployeeResignationListResponse,
    EmployeeResignationSaveResponse,
    EmployeeResignationDeleteResponse
} from '../models/EmployeeResignationModel';

import * as E from 'fp-ts/Either';

const employeeResignationDatasource = new EmployeeResignationDatasourceImpl();

export const employeeResignationService = {
    apiCallPullEmployeeResignation: async (params: FilterWithPaginationEmployeeResignationRequest): Promise<E.Either<Failure, EmployeeResignationListResponse>> => {
        try {
            return E.right(await employeeResignationDatasource.pullEmployeeResignation(params));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateEmployeeResignation: async (formData: FormData): Promise<E.Either<Failure, EmployeeResignationSaveResponse>> => {
        try {
            return E.right(await employeeResignationDatasource.addUpdateEmployeeResignation(formData));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteEmployeeResignation: async (params: DeleteEmployeeResignationRequest): Promise<E.Either<Failure, EmployeeResignationDeleteResponse>> => {
        try {
            return E.right(await employeeResignationDatasource.deleteEmployeeResignation(params));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },
}
