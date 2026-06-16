import type { Failure } from '@/core/api/FailureResponse';
import { NoticeSectionMasterDatasourceImpl } from '@/features/noticeSectionMaster/datasources/NoticeSectionMasterDatasource'

import type {
    FilterWithPaginationNoticeSectionMasterRequest,
    AddUpdateNoticeSectionMasterRequest,
    DeleteNoticeSectionMasterRequest,
    NoticeSectionMasterListResponse,
    NoticeSectionMasterSaveResponse,
    NoticeSectionMasterDeleteResponse
} from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';

import * as E from 'fp-ts/Either';

const noticeSectionMasterDatasource = new NoticeSectionMasterDatasourceImpl();

export const noticeSectionMasterService = {

    apiCallPullNoticeSectionMaster: async (params: FilterWithPaginationNoticeSectionMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, NoticeSectionMasterListResponse>> => {
        try {

            return E.right(await noticeSectionMasterDatasource.pullNoticeSectionMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateNoticeSectionMaster: async (params: AddUpdateNoticeSectionMasterRequest): Promise<E.Either<Failure, NoticeSectionMasterSaveResponse>> => {
        try {

            return E.right(await noticeSectionMasterDatasource.addUpdateNoticeSectionMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteNoticeSectionMaster: async (params: DeleteNoticeSectionMasterRequest): Promise<E.Either<Failure, NoticeSectionMasterDeleteResponse>> => {
        try {

            return E.right(await noticeSectionMasterDatasource.deleteNoticeSectionMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}


