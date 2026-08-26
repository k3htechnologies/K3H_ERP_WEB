import type { Failure } from '@/core/api/FailureResponse';
import { TestDocumentDatasourceImpl } from '@/features/testDocument/datasources/TestDocumentDatasource'
import type {
    DeleteTestDocumentRequest,
    FilterWithPaginationTestDocument,
    TestDocumentDeleteResponse,
    TestDocumentListResponse,
} from '@/features/testDocument/models/TestDocumentModel';

import * as E from 'fp-ts/Either';

const testDocumentDatasource = new TestDocumentDatasourceImpl();

export const testDocumentService = {

    apiCallPullTestDocument: async (params: FilterWithPaginationTestDocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TestDocumentListResponse>> => {
        try {

            return E.right(await testDocumentDatasource.pullTestDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTestDocument: async (formData: FormData): Promise<E.Either<Failure, TestDocumentListResponse>> => {
        try {

            return E.right(await testDocumentDatasource.addUpdateTestDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTestDocument: async (params: DeleteTestDocumentRequest): Promise<E.Either<Failure, TestDocumentDeleteResponse>> => {
        try {

            return E.right(await testDocumentDatasource.deleteTestDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
