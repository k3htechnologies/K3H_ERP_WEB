import type { Failure } from '@/core/api/FailureResponse';
import { CompanyMasterDatasourceImpl } from '@/features/companyMaster/datasources/CompanyMasterDatasource'
import type {
    FilterWithPaginationCompanyMasterRequest,
    DeleteCompanyMasterRequest,
    CompanyMasterListResponse,
    CompanyMasterSaveResponse,
    CompanyMasterDeleteResponse,
    FilterWithPaginationCompanyMasterWithBankDetails,
    CompanyMasterWithBankDetailsListResponse,
    CompanyMasterWithBankDetailsSaveResponse,
    DeleteCompanyMasterWithBankDetailsRequest,
    CompanyMasterWithBankDetailsDeleteResponse
} from '@/features/companyMaster/models/CompanyMasterModel';

import * as E from 'fp-ts/Either';

const companyMasterDatasource = new CompanyMasterDatasourceImpl();

export const companyMasterService = {

    apiCallPullCompanyMaster: async (params: FilterWithPaginationCompanyMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CompanyMasterListResponse>> => {
        try {

            return E.right(await companyMasterDatasource.pullCompanyMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCompanyMaster: async (formData: FormData): Promise<E.Either<Failure, CompanyMasterSaveResponse>> => {
        try {

            return E.right(await companyMasterDatasource.addUpdateCompanyMaster(formData));

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

    apiCallPullCompanyMasterWithBankDetails: async (params: FilterWithPaginationCompanyMasterWithBankDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CompanyMasterWithBankDetailsListResponse>> => {
        try {

            return E.right(await companyMasterDatasource.pullCompanyMasterWithBankDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateCompanyMasterWithBankDetails: async (formData: FormData): Promise<E.Either<Failure, CompanyMasterWithBankDetailsSaveResponse>> => {
        try {

            return E.right(await companyMasterDatasource.addUpdateCompanyMasterWithBankDetails(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteCompanyMasterWithBankDetails: async (params: DeleteCompanyMasterWithBankDetailsRequest): Promise<E.Either<Failure, CompanyMasterWithBankDetailsDeleteResponse>> => {
        try {

            return E.right(await companyMasterDatasource.deleteCompanyMasterWithBankDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}
