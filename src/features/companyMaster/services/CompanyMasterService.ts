import type { Failure } from '@/core/api/FailureResponse';
import { CompanyMasterDatasourceImpl } from '@/features/companyMaster/datasources/CompanyMasterDatasource'
import type {
    FilterWithPaginationCompanyMasterRequest,
    AddUpdateCompanyMasterRequest,
    DeleteCompanyMasterRequest,
    CompanyMasterListResponse,
    CompanyMasterSaveResponse,
    CompanyMasterDeleteResponse
} from '@/features/companyMaster/models/CompanyMasterModel';

import * as E from 'fp-ts/Either';

const companyMasterDatasource = new CompanyMasterDatasourceImpl();

export const CompanyMasterService = {

    apiCallPullCompanyMaster: async (params: FilterWithPaginationCompanyMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CompanyMasterListResponse>> => {
        try {

            return E.right(await companyMasterDatasource.pullCompanyMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCompanyMaster: async (params: AddUpdateCompanyMasterRequest): Promise<E.Either<Failure, CompanyMasterSaveResponse>> => {
        try {

            return E.right(await companyMasterDatasource.addUpdateCompanyMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteCompanyMaster: async (params: DeleteCompanyMasterRequest): Promise<E.Either<Failure, CompanyMasterDeleteResponse>> => {
        try {

            return E.right(await companyMasterDatasource.deleteCompanyMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
