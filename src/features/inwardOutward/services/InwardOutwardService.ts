import type { Failure } from '@/core/api/FailureResponse';

import * as E from 'fp-ts/Either';
import type { DeleteInwardAndOutWardRequest, DeleteInwardOutwardRevertHistoryRequest, FilterWithPaginationInwardAndOutWardRequest, FilterWithPaginationSenderReceiverByMobileNoRequest, InwardAndOutWardDeleteResponse, InwardAndOutWardListResponse, InwardAndOutWardSaveResponse, InwardOutwardRevertSaveResponse, SenderReceiverByMobileNoDataListResponse } from '@/features/inwardOutward/models/InwardOutwardModel';
import { InwardAndOutWardDatasourceImpl } from '@/features/inwardOutward/datasources/InwardOutwardDataSource';

const InwardOutwardDatasource = new InwardAndOutWardDatasourceImpl();

export const inwardOutwardService = {

    apiCallPullInwardOutward: async (params: FilterWithPaginationInwardAndOutWardRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, InwardAndOutWardListResponse>> => {

        try {

            return E.right(await InwardOutwardDatasource.pullInwardAndOutWard(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateInwardOutward: async (formData: FormData): Promise<E.Either<Failure, InwardAndOutWardSaveResponse>> => {
        try {

            return E.right(await InwardOutwardDatasource.addUpdateInwardAndOutWard(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteInwardOutward: async (params: DeleteInwardAndOutWardRequest): Promise<E.Either<Failure, InwardAndOutWardDeleteResponse>> => {
        try {

            return E.right(await InwardOutwardDatasource.deleteInwardAndOutWardRequest(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },


    apiCallAddRevertInwardOutward: async (formData: FormData): Promise<E.Either<Failure, InwardOutwardRevertSaveResponse>> => {
        try {

            return E.right(await InwardOutwardDatasource.addRevertInwardAndOutWard(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteInwardOutwardRevertHistory: async (params: DeleteInwardOutwardRevertHistoryRequest): Promise<E.Either<Failure, InwardAndOutWardDeleteResponse>> => {
        try {

            return E.right(await InwardOutwardDatasource.deleteInwardOutwardRevertHistory(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },


    apiCallPullSenderReceiverByMobileNo: async (params: FilterWithPaginationSenderReceiverByMobileNoRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, SenderReceiverByMobileNoDataListResponse>> => {

        try {

            return E.right(await InwardOutwardDatasource.pullSenderReceiverByMobileNoData(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}


