import type { Failure } from "@/core/api/FailureResponse";
import { LitigationDocumentDatasourceImpl } from '@/features/litigation/datasources/LitigationDocumentDataSource';
import type {

    FilterWithPaginationLitigationDocumentRequest,
    LitigationDocumentListResponse,
    LitigationDocumentSaveResponse,
    LitigationDocumentDeleteResponse,
    DeleteLitigationDocumentRequest,

} from '@/features/litigation/models/LitigationDocumentModel'

import * as E from 'fp-ts/Either';

export const LitigationDocumentDataSource = new LitigationDocumentDatasourceImpl();

export const litigationDocumentService = {

    apiCallPullLitigationDocument: async (params: FilterWithPaginationLitigationDocumentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LitigationDocumentListResponse>> => {

        try {

            return E.right(await LitigationDocumentDataSource.pullLitigationDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateLitigationDocument: async (formData: FormData): Promise<E.Either<Failure, LitigationDocumentSaveResponse>> => {

        try {

            return E.right(await LitigationDocumentDataSource.addUpadateLitigationDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteLitigationDocument: async (params: DeleteLitigationDocumentRequest): Promise<E.Either<Failure, LitigationDocumentDeleteResponse>> => {

        try {

            return E.right(await LitigationDocumentDataSource.deleteLitigationDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}

