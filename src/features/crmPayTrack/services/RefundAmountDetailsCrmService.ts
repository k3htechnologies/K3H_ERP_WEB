import { RefundAmountDetailsDatasourceImpl } from "@/features/crmPayTrack/datasources/RefundAmountDetailsDatasource";
import type {
    RefundAmountDetailsDeleteResponse,
    RefundAmountDetailsListResponse,
    RefundAmountDetailsSaveReponse,
    DeleteRefundAmountDetailsRequest,
    FilterWithPaginationRefundAmountDetails

} from "@/features/crmPayTrack/models/RefundAmountDetailsModel";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";

const RefundAmountDetailsCrmDatasource = new RefundAmountDetailsDatasourceImpl();

export const refundAmountDetailsCrmService = {

    apiCallPullRefundAmountDetails: async (params: FilterWithPaginationRefundAmountDetails, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, RefundAmountDetailsListResponse>> => {
        try {
            return E.right(await RefundAmountDetailsCrmDatasource.pullRefundAmountDetails(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateRefundAmountDetails: async (data: FormData): Promise<E.Either<Failure, RefundAmountDetailsSaveReponse>> => {
        try {
            return E.right(await RefundAmountDetailsCrmDatasource.addUpdateRefundAmountDetails(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeleteRefundAmountDetails: async (params: DeleteRefundAmountDetailsRequest): Promise<E.Either<Failure, RefundAmountDetailsDeleteResponse>> => {
        try {
            return E.right(await RefundAmountDetailsCrmDatasource.deleteRefundAmountDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    }

}