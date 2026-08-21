import type { Failure } from '@/core/api/FailureResponse';
import { DrawingDocumentDatasourceImpl } from '@/features/drawingDocument/datasources/DrawingDocumentDatasource'
import type {
    DeleteDrawingDocumentRequest,
    FilterWithPaginationDrawingDocument,
    DrawingDocumentDeleteResponse,
    DrawingDocumentListResponse,
} from '@/features/drawingDocument/models/DrawingDocumentModel';

import * as E from 'fp-ts/Either';

const drawingDocumentDatasource = new DrawingDocumentDatasourceImpl();

export const drawingDocumentService = {

    apiCallPullDrawingDocument: async (params: FilterWithPaginationDrawingDocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DrawingDocumentListResponse>> => {
        try {

            return E.right(await drawingDocumentDatasource.pullDrawingDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDrawingDocument: async (formData: FormData): Promise<E.Either<Failure, DrawingDocumentListResponse>> => {
        try {

            return E.right(await drawingDocumentDatasource.addUpdateDrawingDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDrawingDocument: async (params: DeleteDrawingDocumentRequest): Promise<E.Either<Failure, DrawingDocumentDeleteResponse>> => {
        try {

            return E.right(await drawingDocumentDatasource.deleteDrawingDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
