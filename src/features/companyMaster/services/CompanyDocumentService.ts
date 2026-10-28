import type { Failure } from '@/core/api/FailureResponse';
import { CompanyDocumentDatasourceImpl } from '@/features/companyMaster/datasources/CompanyDocumentDatasource'
import type {
    CompanyDocumentListResponse,
    FilterWithPaginationCompanyDocumentRequest,
    CompanyDocumentSaveResponse,
    DeleteCompanyDocumentRequest,
    CompanyDocumentDeleteResponse
} from '@/features/companyMaster/models/CompanyDocumentModel'

import * as E from 'fp-ts/Either';

const companyDocumentDatasource = new CompanyDocumentDatasourceImpl();

export const companyDocumentService = {

    apiCallPullCompanyDocument: async (params: FilterWithPaginationCompanyDocumentRequest): Promise<E.Either<Failure, CompanyDocumentListResponse>> => {
        try {

            return E.right(await companyDocumentDatasource.pullCompanyDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCompanyDocument: async (params: FormData): Promise<E.Either<Failure, CompanyDocumentSaveResponse>> => {
        try {

            return E.right(await companyDocumentDatasource.addUpdateCompanyDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteCompanyDocument: async (params: DeleteCompanyDocumentRequest): Promise<E.Either<Failure, CompanyDocumentDeleteResponse>> => {
        try {

            return E.right(await companyDocumentDatasource.deleteCompanyDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
