
import * as E from 'fp-ts/Either';
import type { Failure } from "@/core/api/FailureResponse";
import { BrokerageDatasourceImpl } from '@/features/brokerage/datasources/BrokerageInvoiceDatasource';
import type { BrokerageBookingListResponse, FilterWithPaginationBrokerageBookingRequest } from "@/features/brokerage/models/BrokerageInvoiceModel";

const BrokerageDatasource = new BrokerageDatasourceImpl();

export const BrokerageService = {

    apiCallPullBrokerageBooking: async (params: FilterWithPaginationBrokerageBookingRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BrokerageBookingListResponse>> => {

        try {
            return E.right(await BrokerageDatasource.pullBrokerageBooking(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },

}