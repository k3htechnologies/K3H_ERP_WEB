import type { Failure } from '@/core/api/FailureResponse'

import { TermSheetDocumentDatasourceImpl } from '@/features/termSheet/datasources/TermSheetDocumentDatasource'

import type {
    FilterWithPaginationTermSheetDocumentRequest,
    DeleteTermSheetDocumentRequest,

    TermSheetDocumentListResponse,
    TermSheetDocumentSaveResponse,
    TermSheetDocumentDeleteResponse

} from '@/features/termSheet/models/TermSheetDocumentModel'

import * as E from 'fp-ts/Either'


const termSheetDocumentDatasource = new TermSheetDocumentDatasourceImpl()


export const termSheetDocumentService = {

    apiCallPullTermSheetDocument: async (params: FilterWithPaginationTermSheetDocumentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TermSheetDocumentListResponse>> => {

        try {

            return E.right(await termSheetDocumentDatasource.pullTermSheetDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTermSheetDocument: async (params: FormData): Promise<E.Either<Failure, TermSheetDocumentSaveResponse>> => {

        try {

            return E.right(await termSheetDocumentDatasource.addUpdateTermSheetDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },


    apiCallDeleteTermSheetDocument: async (params: DeleteTermSheetDocumentRequest): Promise<E.Either<Failure, TermSheetDocumentDeleteResponse>> => {

        try {

            return E.right(await termSheetDocumentDatasource.deleteTermSheetDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}