import type { Failure } from '@/core/api/FailureResponse';
import { ApprovalDocumentCategoryMasterDatasourceImpl } from '@/features/approvalDocumentCategory/datasources/ApprovalDocumentCategoryMasterDatasource'
import type {
    AddUpdateApprovalDocumentCategoryMasterRequest,
    DeleteApprovalDocumentCategoryMasterRequest,
    ApprovalDocumentCategoryMasterListResponse,
    ApprovalDocumentCategoryMasterDeleteResponse,
    FilterWithPaginationApprovalDocumentCategoryMaster,
    ApprovalDocumentCategoryMasterSaveReponse
} from '@/features/approvalDocumentCategory/models/ApprovalDocumentCategoryMasterModel';

import * as E from 'fp-ts/Either';

const approvalDocumentCategoryMasterDatasource = new ApprovalDocumentCategoryMasterDatasourceImpl();

export const approvalDocumentCategoryMasterService = {

    apiCallPullApprovalDocumentCategoryMaster: async (params: FilterWithPaginationApprovalDocumentCategoryMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ApprovalDocumentCategoryMasterListResponse>> => {
        
        try {
            return E.right(await approvalDocumentCategoryMasterDatasource.pullApprovalDocumentCategoryMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateApprovalDocumentCategoryMaster: async (params: AddUpdateApprovalDocumentCategoryMasterRequest): Promise<E.Either<Failure, ApprovalDocumentCategoryMasterSaveReponse>> => {
       
        try {

            return E.right(await approvalDocumentCategoryMasterDatasource.addUpdateApprovalDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteApprovalDocumentCategoryMaster: async (params: DeleteApprovalDocumentCategoryMasterRequest): Promise<E.Either<Failure, ApprovalDocumentCategoryMasterDeleteResponse>> => {
        
        try {

            return E.right(await approvalDocumentCategoryMasterDatasource.deleteApprovalDocumentCategoryMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}



