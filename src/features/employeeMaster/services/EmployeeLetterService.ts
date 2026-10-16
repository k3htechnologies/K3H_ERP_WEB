import type { Failure } from '@/core/api/FailureResponse';
import * as E from 'fp-ts/Either';
import { EmployeeLetterDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeLetterDatasource';
import type { AddUpdateEmployeeLetter, AddUpdateEmployeeLetterAcceptEmployee, AddUpdateEmployeeLetterShowEmployee, DeleteEmployeeLetter, EmployeeLetterAcceptEmployeeSaveResponse, EmployeeLetterDeleteResponse, EmployeeLetterListResponse, EmployeeLetterSaveResponse, EmployeeLetterShowEmployeeSaveResponse, FilterWithPaginationEmployeeLetterRequest } from '@/features/employeeMaster/models/EmployeeLetterModal';

const employeeLetterDatasource = new EmployeeLetterDatasourceImpl();

export const employeeLetterService = {

    apiCallPullEmployeeLetter: async (params: FilterWithPaginationEmployeeLetterRequest): Promise<E.Either<Failure, EmployeeLetterListResponse>> => {
        try {

            return E.right(await employeeLetterDatasource.pullEmployeeLetter(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeLetter: async (data: AddUpdateEmployeeLetter): Promise<E.Either<Failure, EmployeeLetterSaveResponse>> => {
        try {

            return E.right(await employeeLetterDatasource.addUpdateEmployeeLetter(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeLetterShowEmployee: async (data: AddUpdateEmployeeLetterShowEmployee): Promise<E.Either<Failure, EmployeeLetterShowEmployeeSaveResponse>> => {
        try {

            return E.right(await employeeLetterDatasource.addUpdateEmployeeLetterShowEmployee(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeLetterAcceptEmployee: async (data: AddUpdateEmployeeLetterAcceptEmployee): Promise<E.Either<Failure, EmployeeLetterAcceptEmployeeSaveResponse>> => {
        try {

            return E.right(await employeeLetterDatasource.addUpdateEmployeeLetterAcceptEmployee(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEmployeeLetter: async (params: DeleteEmployeeLetter): Promise<E.Either<Failure, EmployeeLetterDeleteResponse>> => {
        try {

            return E.right(await employeeLetterDatasource.deleteEmployeeLetter(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
