import type { Failure } from '@/core/api/FailureResponse';

import * as E from 'fp-ts/Either';
import { ApprovedBankWithFolderDatasourceImpl } from '@/features/approvedBank/datasources/ApprovedBankFolderDatasource';
import type {

    AddUpdateApprovedBankFolderRequest,
    ApprovedBankFolderListResponse,
    ApprovedBankWithFolderDeleteResponse,
    ApprovedBankWithFolderSaveResponse,
    DeleteApprovedBankFolderRequest,
    FilterWithPaginationApprovedBankFolderRequest

} from '@/features/approvedBank/models/ApprovedBankFolderModel';


const ApprovedBankFolderDatasource = new ApprovedBankWithFolderDatasourceImpl();

export const approvedBankFolderService = {

    apiCallPullApprovedBankWithFolder: async (params: FilterWithPaginationApprovedBankFolderRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ApprovedBankFolderListResponse>> => {
        try {

            return E.right(await ApprovedBankFolderDatasource.pullApprovedBankFolder(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateApprovedBankWithFolder: async (params: AddUpdateApprovedBankFolderRequest): Promise<E.Either<Failure, ApprovedBankWithFolderSaveResponse>> => {
        try {

            return E.right(await ApprovedBankFolderDatasource.addUpdateApprovedBankFolder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },


    apiCallDeleteApprovedBankWithFolder: async (params: DeleteApprovedBankFolderRequest): Promise<E.Either<Failure, ApprovedBankWithFolderDeleteResponse>> => {
        try {

            return E.right(await ApprovedBankFolderDatasource.deleteApprovedBankFolder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
