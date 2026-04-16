import { PaymentLedgerDatasourceImpl } from "@/features/crmPayTrack/datasources/PaymentLedgerDatasource";
import type {

    PaymentLedgerDeleteResponse,
    DeletePaymentLedgerRequest,
    FilterWithPaginationPaymentLedger,
    PaymentLedgerSummaryListResponse,
    PaymentLedgerListResponse

} from "@/features/crmPayTrack/models/PaymentLedgerModel";
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";


const PaymentLedgerDatasource = new PaymentLedgerDatasourceImpl();

export const paymentLedgerService = {

    apiCallPullPaymentLedger: async (params: FilterWithPaginationPaymentLedger, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentLedgerListResponse>> => {

        try {
            return E.right(await PaymentLedgerDatasource.pullPaymentLedger(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallPullPaymentLedgerSummary: async (params: FilterWithPaginationPaymentLedger, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentLedgerSummaryListResponse>> => {

        try {
            return E.right(await PaymentLedgerDatasource.pullPaymentLedgerSummary(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    

    apiCallAddUpdatePaymentLedger: async (data: FormData): Promise<E.Either<Failure, PaymentLedgerSummaryListResponse>> => {

        try {

            return E.right(await PaymentLedgerDatasource.addUpdatePaymentLedger(data));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallDeletePaymentLedgerCrm: async (params: DeletePaymentLedgerRequest): Promise<E.Either<Failure, PaymentLedgerDeleteResponse>> => {
        try {

            return E.right(await PaymentLedgerDatasource.deletePaymentLedger(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    }
}