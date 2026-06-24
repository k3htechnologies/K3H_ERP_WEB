import type { Failure } from "@/core/api/FailureResponse";
import { TaxTrackerDatasourceImpl } from '@/features/taxTracker/datasources/TaxTrackerDatasource';
import type {
    FilterWithPaginationTaxTrackerRequest,
    TaxTrackerListResponse,
    TaxTrackerSaveResponse,
    TaxTrackerDeleteResponse,
    DeleteTaxTrackerRequest,

} from '@/features/taxTracker/models/TaxTrackerModel'

import * as E from 'fp-ts/Either';

export const taxTrackerDatasource = new TaxTrackerDatasourceImpl();

export const taxTrackerService = {

    apiCallPullTaxTracker: async (params: FilterWithPaginationTaxTrackerRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaxTrackerListResponse>> => {

        try {

            return E.right(await taxTrackerDatasource.pullTaxTracker(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateTaxTracker: async (formData: FormData): Promise<E.Either<Failure, TaxTrackerSaveResponse>> => {

        try {

            return E.right(await taxTrackerDatasource.addUpadateTaxTracker(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteTaxTracker: async (params: DeleteTaxTrackerRequest): Promise<E.Either<Failure, TaxTrackerDeleteResponse>> => {

        try {

            return E.right(await taxTrackerDatasource.deleteTaxTracker(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}