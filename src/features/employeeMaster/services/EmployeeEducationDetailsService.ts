import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeEducationDetailsDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeEducationDetailsDatasource'
import type {
    EmployeeEducationDetailsListResponse,
    FilterWithPaginationEmployeeEducationDetailsRequest,
    EmployeeEducationDetailsSaveResponse,
    DeleteEmployeeEducationDetailsRequest,
    EmployeeEducationDetailsDeleteResponse,
    AddUpdateEmployeeEducationDetailsRequest
} from '@/features/employeeMaster/models/EmployeeEducationDetailsModel'

import * as E from 'fp-ts/Either';

const employeeEducationDetailsDatasource = new EmployeeEducationDetailsDatasourceImpl();

export const employeeEducationDetailsService = {

    apiCallPullEmployeeEducationDetails: async (params: FilterWithPaginationEmployeeEducationDetailsRequest): Promise<E.Either<Failure, EmployeeEducationDetailsListResponse>> => {
        try {

            return E.right(await employeeEducationDetailsDatasource.pullEmployeeEducationDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeEducationDetails: async (params: AddUpdateEmployeeEducationDetailsRequest): Promise<E.Either<Failure, EmployeeEducationDetailsSaveResponse>> => {
        try {

            return E.right(await employeeEducationDetailsDatasource.addUpdateEmployeeEducationDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEmployeeEducationDetails: async (params: DeleteEmployeeEducationDetailsRequest): Promise<E.Either<Failure, EmployeeEducationDetailsDeleteResponse>> => {
        try {

            return E.right(await employeeEducationDetailsDatasource.deleteEmployeeEducationDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
