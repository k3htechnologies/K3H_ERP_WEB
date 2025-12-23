import type { Failure } from '@/core/api/FailureResponse';
import { EmployeeDocumentDatasourceImpl } from '@/features/employeeMaster/datasources/EmployeeDocumentDatasource'
import type {
    EmployeeDocumentListResponse,
    FilterWithPaginationEmployeeDocumentRequest,
    EmployeeDocumentSaveResponse,
    DeleteEmployeeDocumentRequest,
    EmployeeDocumentDeleteResponse
} from '@/features/employeeMaster/models/EmployeeDocumentModel'

import * as E from 'fp-ts/Either';

const employeeDocumentDatasource = new EmployeeDocumentDatasourceImpl();

export const employeeDocumentService = {

    apiCallPullEmployeeDocument: async (params: FilterWithPaginationEmployeeDocumentRequest): Promise<E.Either<Failure, EmployeeDocumentListResponse>> => {
        try {

            return E.right(await employeeDocumentDatasource.pullEmployeeDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateEmployeeDocument: async (params: FormData): Promise<E.Either<Failure, EmployeeDocumentSaveResponse>> => {
        try {

            return E.right(await employeeDocumentDatasource.addUpdateEmployeeDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteEmployeeDocument: async (params: DeleteEmployeeDocumentRequest): Promise<E.Either<Failure, EmployeeDocumentDeleteResponse>> => {
        try {

            return E.right(await employeeDocumentDatasource.deleteEmployeeDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
