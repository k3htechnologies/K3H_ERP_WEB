import type { Failure } from '@/core/api/FailureResponse';
import { ProjectDocumentCategoryMasterDatasourceImpl } from '@/features/projectDocumentCategory/datasources/ProjectDocumentCategoryMasterDatasource'
import type {
    AddUpdateProjectDocumentCategoryMasterRequest,
    DeleteProjectDocumentCategoryMasterRequest,
    ProjectDocumentCategoryMasterListResponse,
    ProjectDocumentCategoryMasterDeleteResponse,
    FilterWithPaginationProjectDocumentCategoryMaster,
    ProjectDocumentCategoryMasterSaveReponse
} from '@/features/projectDocumentCategory/models/ProjectDocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const projectDocumentCategoryMasterDatasource = new ProjectDocumentCategoryMasterDatasourceImpl();

export const projectDocumentCategoryMasterService = {

    apiCallPullProjectDocumentCategoryMaster: async (params: FilterWithPaginationProjectDocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectDocumentCategoryMasterListResponse>> => {
       
        try {
            return E.right(await projectDocumentCategoryMasterDatasource.pullProjectDocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectDocumentCategoryMaster: async (params: AddUpdateProjectDocumentCategoryMasterRequest): Promise<E.Either<Failure, ProjectDocumentCategoryMasterSaveReponse>> => {
        
        try {

            return E.right(await projectDocumentCategoryMasterDatasource.addUpdateProjectDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectDocumentCategoryMaster: async (params: DeleteProjectDocumentCategoryMasterRequest): Promise<E.Either<Failure, ProjectDocumentCategoryMasterDeleteResponse>> => {
        
        try {

            return E.right(await projectDocumentCategoryMasterDatasource.deleteProjectDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
