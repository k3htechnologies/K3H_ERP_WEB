import type { Failure } from '@/core/api/FailureResponse';
import { BaselineCostPlanDocumentDatasourceImpl } from '@/features/baselineCostPlanDocument/datasources/BaselineCostPlanDocumentDatasource'
import type {
    DeleteBaselineCostPlanDocumentRequest,
    FilterWithPaginationBaselineCostPlanDocument,
    BaselineCostPlanDocumentDeleteResponse,
    BaselineCostPlanDocumentListResponse,
} from '@/features/baselineCostPlanDocument/models/BaselineCostPlanDocumentModel';

import * as E from 'fp-ts/Either';

const baselineCostPlanDocumentDatasource = new BaselineCostPlanDocumentDatasourceImpl();

export const baselineCostPlanDocumentService = {

    apiCallPullBaselineCostPlanDocument: async (params: FilterWithPaginationBaselineCostPlanDocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BaselineCostPlanDocumentListResponse>> => {
        try {

            return E.right(await baselineCostPlanDocumentDatasource.pullBaselineCostPlanDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateBaselineCostPlanDocument: async (formData: FormData): Promise<E.Either<Failure, BaselineCostPlanDocumentListResponse>> => {
        try {

            return E.right(await baselineCostPlanDocumentDatasource.addUpdateBaselineCostPlanDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteBaselineCostPlanDocument: async (params: DeleteBaselineCostPlanDocumentRequest): Promise<E.Either<Failure, BaselineCostPlanDocumentDeleteResponse>> => {
        try {

            return E.right(await baselineCostPlanDocumentDatasource.deleteBaselineCostPlanDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
