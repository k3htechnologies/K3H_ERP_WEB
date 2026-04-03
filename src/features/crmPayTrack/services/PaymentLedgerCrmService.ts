import { PaymentLedgerCrmDatasourceImpl } from "@/features/crmPayTrack/datasources/PaymentLedgerCrmDatasource";
import type {

    PaymentLedgerCrmDeleteResponse,
    PaymentLedgerCrmListResponse,
    PaymentLedgerCrmSaveResponse,
    DeletePaymentLedgerCrmRequest,
    FilterWithPaginationPaymentLedgerCrm

} from "@/features/crmPayTrack/models/PaymentLedgerCrmModel";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";


const PaymentLedgerCrmDatasource = new PaymentLedgerCrmDatasourceImpl();

export const paymentLedgerCrmService = {

    apiCallPullPaymentLedgerCrm: async (params: FilterWithPaginationPaymentLedgerCrm, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentLedgerCrmListResponse>> => {

        try {
            return E.right(await PaymentLedgerCrmDatasource.pullPaymentLedgerCrm(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdatePaymentLedgerCrm: async (data: FormData): Promise<E.Either<Failure, PaymentLedgerCrmSaveResponse>> => {

        try {

            return E.right(await PaymentLedgerCrmDatasource.addUpdatePaymentLedgerCrm(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeletePaymentLedgerCrm: async (params: DeletePaymentLedgerCrmRequest): Promise<E.Either<Failure, PaymentLedgerCrmDeleteResponse>> => {
        try {

            return E.right(await PaymentLedgerCrmDatasource.deletePaymentLedgerCrm(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}