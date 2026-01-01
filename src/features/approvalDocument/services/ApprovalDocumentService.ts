import type { Failure } from '@/core/api/FailureResponse';
import { ApprovalDocumentDatasourceImpl } from '@/features/approvalDocument/datasources/ApprovalDocumentDatasource'
import type {
    DeleteApprovalDocumentRequest,
    FilterWithPaginationApprovalDocument,
    ApprovalDocumentDeleteResponse,
    ApprovalDocumentListResponse,
} from '@/features/approvalDocument/models/ApprovalDocumentModel';

import * as E from 'fp-ts/Either';

const approvalDocumentDatasource = new ApprovalDocumentDatasourceImpl();

export const ApprovalDocumentService = {

    apiCallPullApprovalDocument: async (params: FilterWithPaginationApprovalDocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ApprovalDocumentListResponse>> => {
        try {

            return E.right(await approvalDocumentDatasource.pullApprovalDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateApprovalDocument: async (formData: FormData): Promise<E.Either<Failure, ApprovalDocumentListResponse>> => {
        try {

            return E.right(await approvalDocumentDatasource.addUpdateApprovalDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteApprovalDocument: async (params: DeleteApprovalDocumentRequest): Promise<E.Either<Failure, ApprovalDocumentDeleteResponse>> => {
        try {

            return E.right(await approvalDocumentDatasource.deleteApprovalDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}

