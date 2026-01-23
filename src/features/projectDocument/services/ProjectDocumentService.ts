import type { Failure } from '@/core/api/FailureResponse';
import { ProjectDocumentDatasourceImpl } from '@/features/projectDocument/datasources/ProjectDocumentDatasource'
import type {
    DeleteProjectDocumentRequest,
    FilterWithPaginationProjectDocument,
    ProjectDocumentDeleteResponse,
    ProjectDocumentListResponse,
} from '@/features/projectDocument/models/ProjectDocumentModel';

import * as E from 'fp-ts/Either';

const projectDocumentDatasource = new ProjectDocumentDatasourceImpl();

export const projectDocumentService = {

    apiCallPullProjectDocument: async (params: FilterWithPaginationProjectDocument, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectDocumentListResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.pullProjectDocument(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectDocument: async (formData: FormData): Promise<E.Either<Failure, ProjectDocumentListResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.addUpdateProjectDocument(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectDocument: async (params: DeleteProjectDocumentRequest): Promise<E.Either<Failure, ProjectDocumentDeleteResponse>> => {
        try {

            return E.right(await projectDocumentDatasource.deleteProjectDocument(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

}
