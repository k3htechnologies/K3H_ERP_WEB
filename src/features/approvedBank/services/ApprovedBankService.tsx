import type { Failure } from '@/core/api/FailureResponse';

import * as E from 'fp-ts/Either';
import { ApprovedBankWithFolderDatasourceImpl } from '@/features/approvedBank/datasources/ApprovedBankDatasource';
import type { AddUpdateApprovedBankWithFolderRequest, ApprovedBankFolderListResponse, ApprovedBankWithFolderDeleteResponse, ApprovedBankWithFolderSaveResponse, DeleteApprovedBankWithFolderRequest, FilterWithPaginationApprovedBankWithFolderRequest } from '../models/ApprovedBankModel';


const ApprovedBankWithFolderDatasource = new ApprovedBankWithFolderDatasourceImpl();

export const approvedBankWithFolderService = {

    apiCallPullApprovedBankWithFolder: async (params: FilterWithPaginationApprovedBankWithFolderRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ApprovedBankFolderListResponse>> => {
        try {

            return E.right(await ApprovedBankWithFolderDatasource.pullApprovedBankWithFolder(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateApprovedBankWithFolder: async (params: AddUpdateApprovedBankWithFolderRequest): Promise<E.Either<Failure, ApprovedBankWithFolderSaveResponse>> => {
        try {

            return E.right(await ApprovedBankWithFolderDatasource.addUpdateApprovedBankWithFolder(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteApprovedBankWithFolder: async (params: DeleteApprovedBankWithFolderRequest): Promise<E.Either<Failure, ApprovedBankWithFolderDeleteResponse>> => {
        try {

            return E.right(await ApprovedBankWithFolderDatasource.deleteApprovedBankWithFolderRequest(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
