
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { PaymentScheduleMasterDatasourceImpl } from '@/features/paymentScheduleMaster/datasources/PaymentScheduleMasterDataSource';
import type { PaymentScheduleMasterDeleteResponse, PaymentScheduleMasterListResponse, PaymentScheduleMasterSaveResponse, DeletePaymentScheduleMasterRequest, FilterWithPaginationPaymentScheduleMasterRequest, AddUpdatePaymentScheduleMasterRequest } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";

const PaymentScheduleMasterDatasource = new PaymentScheduleMasterDatasourceImpl();

export const paymentScheduleMasterService = {

    apiCallPullPaymentScheduleMaster: async (params: FilterWithPaginationPaymentScheduleMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentScheduleMasterListResponse>> => {

        try {
            return E.right(await PaymentScheduleMasterDatasource.pullPaymentScheduleMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdatePaymentScheduleMaster: async (params: AddUpdatePaymentScheduleMasterRequest): Promise<E.Either<Failure, PaymentScheduleMasterSaveResponse>> => {
        try {

            return E.right(await PaymentScheduleMasterDatasource.addUpdatePaymentScheduleMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeletePaymentScheduleMaster: async (params: DeletePaymentScheduleMasterRequest): Promise<E.Either<Failure, PaymentScheduleMasterDeleteResponse>> => {
        try {

            return E.right(await PaymentScheduleMasterDatasource.deletePaymentScheduleMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}