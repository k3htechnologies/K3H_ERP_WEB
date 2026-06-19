import type { Failure } from '@/core/api/FailureResponse';
import { TaxTrackerDocumentDatasourceImpl } from '@/features/taxTracker/datasources/TaxTrackerDocumentDatasource';

import type {
    DeleteTaxTrackerDocumentRequest,
    FilterWithPaginationTaxTrackerDocumentRequest,
    TaxTrackerDocumentSaveResponse,
    TaxTrackerDocumentDeleteResponse,
    TaxTrackerDocumentListResponse,
} from '@/features/taxTracker/models/TaxTrackerDocumentModel';

import * as E from 'fp-ts/Either';

const taxTrackerDocumentServices = new TaxTrackerDocumentDatasourceImpl();

export const taxTrackerDocumentService = {

    apiCallPullTaxTrackerDocument: async (params: FilterWithPaginationTaxTrackerDocumentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TaxTrackerDocumentListResponse>> => {
        try {

            return E.right(await taxTrackerDocumentServices.pullTaxTrackerDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTaxTrackerDocument: async (formData: FormData): Promise<E.Either<Failure, TaxTrackerDocumentSaveResponse>> => {
        try {

            return E.right(await taxTrackerDocumentServices.addUpdateTaxTrackerDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTaxTrackerDocument: async (params: DeleteTaxTrackerDocumentRequest): Promise<E.Either<Failure, TaxTrackerDocumentDeleteResponse>> => {
        try {

            return E.right(await taxTrackerDocumentServices.deleteTaxTrackerDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}

