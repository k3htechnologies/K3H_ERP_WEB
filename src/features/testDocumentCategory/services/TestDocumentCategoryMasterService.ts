import type { Failure } from '@/core/api/FailureResponse';
import { TestDocumentCategoryMasterDatasourceImpl } from '@/features/testDocumentCategory/datasources/TestDocumentCategoryMasterDatasource'
import type {
    AddUpdateTestDocumentCategoryMasterRequest,
    DeleteTestDocumentCategoryMasterRequest,
    TestDocumentCategoryMasterListResponse,
    TestDocumentCategoryMasterDeleteResponse,
    FilterWithPaginationTestDocumentCategoryMaster,
    TestDocumentCategoryMasterSaveReponse
} from '@/features/testDocumentCategory/models/TestDocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const testDocumentCategoryMasterDatasource = new TestDocumentCategoryMasterDatasourceImpl();

export const testDocumentCategoryMasterService = {

    apiCallPullTestDocumentCategoryMaster: async (params: FilterWithPaginationTestDocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TestDocumentCategoryMasterListResponse>> => {
       
        try {
            return E.right(await testDocumentCategoryMasterDatasource.pullTestDocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateTestDocumentCategoryMaster: async (params: AddUpdateTestDocumentCategoryMasterRequest): Promise<E.Either<Failure, TestDocumentCategoryMasterSaveReponse>> => {
        
        try {

            return E.right(await testDocumentCategoryMasterDatasource.addUpdateTestDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteTestDocumentCategoryMaster: async (params: DeleteTestDocumentCategoryMasterRequest): Promise<E.Either<Failure, TestDocumentCategoryMasterDeleteResponse>> => {
        
        try {

            return E.right(await testDocumentCategoryMasterDatasource.deleteTestDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
