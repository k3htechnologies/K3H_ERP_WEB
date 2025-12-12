import type { Failure } from '@/core/api/FailureResponse';
import { VendorDatasourceImpl } from '@/features/vendor/datasources/VendorDatasource'
import type {
    FilterWithPaginationVendorRequest,
    DeleteVendorRequest,
    VendorListResponse,
    VendorSaveResponse,
    VendorDeleteResponse
} from '@/features/vendor/models/VendorModel'

import * as E from 'fp-ts/Either';

const vendorDatasource = new VendorDatasourceImpl();

export const VendorService = {

    apiCallPullVendor: async (params: FilterWithPaginationVendorRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, VendorListResponse>> => {
        try {

            return E.right(await vendorDatasource.pullVendor(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateVendor: async (formData: FormData): Promise<E.Either<Failure, VendorSaveResponse>> => {
        try {

            return E.right(await vendorDatasource.addUpdateVendor(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteVendor: async (params: DeleteVendorRequest): Promise<E.Either<Failure, VendorDeleteResponse>> => {
        try {

            return E.right(await vendorDatasource.deleteVendor(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
