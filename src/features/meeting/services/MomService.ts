import type { Failure } from '@/core/api/FailureResponse'
import * as E from 'fp-ts/Either'
import { MomDatasourceImpl } from '@/features/meeting/datasources/MomDatasource'
import type { MOMDocumentSaveResponse } from '@/features/meeting/models/MomModel'

const momDatasource = new MomDatasourceImpl()

export const momService = {
    apiCallAddUpdateMOMDocuments: async (
        formData: FormData,
    ): Promise<E.Either<Failure, MOMDocumentSaveResponse>> => {
        try {
            return E.right(await momDatasource.addUpdateMOMDocuments(formData))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },
}
