import type { Failure } from '@/core/api/FailureResponse';
import { DrawingDocumentCategoryMasterDatasourceImpl } from '@/features/drawingDocumentCategory/datasources/DrawingDocumentCategoryMasterDatasource'
import type {
    AddUpdateDrawingDocumentCategoryMasterRequest,
    DeleteDrawingDocumentCategoryMasterRequest,
    DrawingDocumentCategoryMasterListResponse,
    DrawingDocumentCategoryMasterDeleteResponse,
    FilterWithPaginationDrawingDocumentCategoryMaster,
    DrawingDocumentCategoryMasterSaveReponse
} from '@/features/drawingDocumentCategory/models/DrawingDocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const drawingDocumentCategoryMasterDatasource = new DrawingDocumentCategoryMasterDatasourceImpl();

export const drawingDocumentCategoryMasterService = {

    apiCallPullDrawingDocumentCategoryMaster: async (params: FilterWithPaginationDrawingDocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, DrawingDocumentCategoryMasterListResponse>> => {
       
        try {
            return E.right(await drawingDocumentCategoryMasterDatasource.pullDrawingDocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateDrawingDocumentCategoryMaster: async (params: AddUpdateDrawingDocumentCategoryMasterRequest): Promise<E.Either<Failure, DrawingDocumentCategoryMasterSaveReponse>> => {
        
        try {

            return E.right(await drawingDocumentCategoryMasterDatasource.addUpdateDrawingDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteDrawingDocumentCategoryMaster: async (params: DeleteDrawingDocumentCategoryMasterRequest): Promise<E.Either<Failure, DrawingDocumentCategoryMasterDeleteResponse>> => {
        
        try {

            return E.right(await drawingDocumentCategoryMasterDatasource.deleteDrawingDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
