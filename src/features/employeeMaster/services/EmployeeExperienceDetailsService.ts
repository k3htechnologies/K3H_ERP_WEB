import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeExperienceDetailsDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeExperienceDetailsDatasource'
import type {
    EmployeeExperienceDetailsListResponse,
    FilterWithPaginationEmployeeExperienceDetailsRequest,
    EmployeeExperienceDetailsSaveResponse,
    DeleteEmployeeExperienceDetailsRequest,
    EmployeeExperienceDetailsDeleteResponse,
    AddUpdateEmployeeExperienceDetailsRequest
} from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal'

import * as E from 'fp-ts/Either';

const employeeExperienceDetailsDatasource = new EmployeeExperienceDetailsDatasourceImpl();

export const employeeExperienceDetailsService = {

    apiCallPullEmployeeExperienceDetails: async (params: FilterWithPaginationEmployeeExperienceDetailsRequest): Promise<E.Either<Failure, EmployeeExperienceDetailsListResponse>> => {
        try {

            return E.right(await employeeExperienceDetailsDatasource.pullEmployeeExperienceDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeExperienceDetails: async (params: AddUpdateEmployeeExperienceDetailsRequest): Promise<E.Either<Failure, EmployeeExperienceDetailsSaveResponse>> => {
        try {

            return E.right(await employeeExperienceDetailsDatasource.addUpdateEmployeeExperienceDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEmployeeExperienceDetails: async (params: DeleteEmployeeExperienceDetailsRequest): Promise<E.Either<Failure, EmployeeExperienceDetailsDeleteResponse>> => {
        try {

            return E.right(await employeeExperienceDetailsDatasource.deleteEmployeeExperienceDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
