import type { Failure } from '@/core/api/FailureResponse';
import { ProjectRERADocumentDatasourceImpl } from '@/features/projectRERADocument/datasources/ProjectRERADocumentDatasource'
import type {
    DeleteProjectRERADocumentRequest,
    FilterWithPaginationProjectRERADocument,
    ProjectRERADocumentDeleteResponse,
    ProjectRERADocumentListResponse,
} from '@/features/projectRERADocument/models/ProjectRERADocumentModel';

import * as E from 'fp-ts/Either';

const projectDocumentDatasource = new ProjectRERADocumentDatasourceImpl();

export const projectRERADocumentService = {

    apiCallPullProjectRERADocument: async (params: FilterWithPaginationProjectRERADocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectRERADocumentListResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.pullProjectRERADocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectRERADocument: async (formData: FormData): Promise<E.Either<Failure, ProjectRERADocumentListResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.addUpdateProjectRERADocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectRERADocument: async (params: DeleteProjectRERADocumentRequest): Promise<E.Either<Failure, ProjectRERADocumentDeleteResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.deleteProjectRERADocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
