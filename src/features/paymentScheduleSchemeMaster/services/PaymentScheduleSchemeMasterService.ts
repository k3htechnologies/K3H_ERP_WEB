import type { Failure } from '@/core/api/FailureResponse';
import { PaymentScheduleSchemeMasterDatasourceImpl } from '@/features/paymentScheduleSchemeMaster/datasources/PaymentScheduleSchemeMasterDatasource'
import type {
    AddUpdatePaymentScheduleSchemeMasterRequest,
    DeletePaymentScheduleSchemeMasterRequest,
    PaymentScheduleSchemeMasterListResponse,
    PaymentScheduleSchemeMasterDeleteResponse,
    FilterWithPaginationPaymentScheduleSchemeMaster,
    PaymentScheduleSchemeMasterSaveReponse
} from '@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel';

import * as E from 'fp-ts/Either';

const paymentScheduleSchemeMasterDatasource = new PaymentScheduleSchemeMasterDatasourceImpl();

export const paymentScheduleSchemeMasterService = {

    apiCallPullPaymentScheduleSchemeMaster: async (params: FilterWithPaginationPaymentScheduleSchemeMaster, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentScheduleSchemeMasterListResponse>> => {
        
        try {
            return E.right(await paymentScheduleSchemeMasterDatasource.pullPaymentScheduleSchemeMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdatePaymentScheduleSchemeMaster: async (params: AddUpdatePaymentScheduleSchemeMasterRequest): Promise<E.Either<Failure, PaymentScheduleSchemeMasterSaveReponse>> => {
       
        try {

            return E.right(await paymentScheduleSchemeMasterDatasource.addUpdatePaymentScheduleSchemeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeletePaymentScheduleSchemeMaster: async (params: DeletePaymentScheduleSchemeMasterRequest): Promise<E.Either<Failure, PaymentScheduleSchemeMasterDeleteResponse>> => {
        
        try {

            return E.right(await paymentScheduleSchemeMasterDatasource.deletePaymentScheduleSchemeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}



