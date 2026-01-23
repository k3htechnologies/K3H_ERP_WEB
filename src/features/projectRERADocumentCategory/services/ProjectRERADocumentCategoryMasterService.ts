import type { Failure } from '@/core/api/FailureResponse';
import { ProjectRERADocumentCategoryMasterDatasourceImpl } from '@/features/projectRERADocumentCategory/datasources/ProjectRERADocumentCategoryMasterDatasource'
import type {
    AddUpdateProjectRERADocumentCategoryMasterRequest,
    DeleteProjectRERADocumentCategoryMasterRequest,
    ProjectRERADocumentCategoryMasterListResponse,
    ProjectRERADocumentCategoryMasterDeleteResponse,
    FilterWithPaginationProjectRERADocumentCategoryMaster,
    ProjectRERADocumentCategoryMasterSaveReponse
} from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const projectRERADocumentCategoryMasterDatasource = new ProjectRERADocumentCategoryMasterDatasourceImpl();

export const projectRERADocumentCategoryMasterService = {

    apiCallPullProjectRERADocumentCategoryMaster: async (params: FilterWithPaginationProjectRERADocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectRERADocumentCategoryMasterListResponse>> => {

        try {

            return E.right(await projectRERADocumentCategoryMasterDatasource.pullProjectRERADocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectRERADocumentCategoryMaster: async (params: AddUpdateProjectRERADocumentCategoryMasterRequest): Promise<E.Either<Failure, ProjectRERADocumentCategoryMasterSaveReponse>> => {

        try {

            return E.right(await projectRERADocumentCategoryMasterDatasource.addUpdateProjectRERADocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectRERADocumentCategoryMaster: async (params: DeleteProjectRERADocumentCategoryMasterRequest): Promise<E.Either<Failure, ProjectRERADocumentCategoryMasterDeleteResponse>> => {

        try {

            return E.right(await projectRERADocumentCategoryMasterDatasource.deleteProjectRERADocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
