import type { Failure } from '@/core/api/FailureResponse';
import { TenantDatasourceImpl } from '@/features/tenant/datasources/TenantDatasource'
import type {
    FilterWithPaginationTenantRequest,
    AddUpdateTenantRequest,
    TenantListResponse,
    DeleteTenantRequest,
    TenantDeleteResponse,
    TenantDocumentListResponse,
    FilterWithPaginationTenantDocumentRequest,
    TenantDocumentSaveResponse,
    TenantDocumentDeleteResponse,
    DeleteTenantDocumentRequest
} from '@/features/tenant/models/TenantModel'

import * as E from 'fp-ts/Either';

const tenantDatasource = new TenantDatasourceImpl();

export const tenantService = {

    apiCallPullTenant: async (params: FilterWithPaginationTenantRequest): Promise<E.Either<Failure, TenantListResponse>> => {
        try {

            return E.right(await tenantDatasource.pullTenant(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTenant: async (data: AddUpdateTenantRequest): Promise<E.Either<Failure, TenantListResponse>> => {
        try {

            return E.right(await tenantDatasource.addUpdateTenant(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTenant: async (data: DeleteTenantRequest): Promise<E.Either<Failure, TenantDeleteResponse>> => {
        try {

            return E.right(await tenantDatasource.deleteTenant(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullTenantDocument: async (params: FilterWithPaginationTenantDocumentRequest): Promise<E.Either<Failure, TenantDocumentListResponse>> => {
        try {

            return E.right(await tenantDatasource.pullTenantDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTenantDocument: async (formData: FormData): Promise<E.Either<Failure, TenantDocumentSaveResponse>> => {
        try {

            return E.right(await tenantDatasource.addUpdateTenantDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTenantDocument: async (params: DeleteTenantDocumentRequest): Promise<E.Either<Failure, TenantDocumentDeleteResponse>> => {
        try {

            return E.right(await tenantDatasource.deleteTenantDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
