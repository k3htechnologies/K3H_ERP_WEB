import type { Failure } from '@/core/api/FailureResponse';
import type {  AddUpdatePayTrackPaymentScheduleDemandRequest, FilterWithPaginationPaymentSchedule, FilterWithPaginationPaymentScheduleDemandSummary, PaymentScheduleDemandResponse, PaymentScheduleDemandSummaryListResponse, PaymentScheduleListResponse } from '@/features/crmPayTrack/models/PaymentScheduleModel';
import * as E from 'fp-ts/Either';
import { PaymentScheduleDatasourceImpl } from '@/features/crmPayTrack/datasources/PaymentScheduleDatasource';

const paymentScheduleDatasource = new PaymentScheduleDatasourceImpl();

export const paymentScheduleService = {

    apiCallPullPaymentSchedule: async (params: FilterWithPaginationPaymentSchedule, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentScheduleListResponse>> => {

        try {

            return E.right(await paymentScheduleDatasource.pullPaymentSchedule(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullPaymentScheduleDemandSummary: async (params: FilterWithPaginationPaymentScheduleDemandSummary, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentScheduleDemandSummaryListResponse>> => {

        try {

            return E.right(await paymentScheduleDatasource.pullPaymentScheduleDemandSummary(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddPayTrackPaymentScheduleDemand: async (params: AddUpdatePayTrackPaymentScheduleDemandRequest): Promise<E.Either<Failure, PaymentScheduleDemandResponse>> => {

        try {

            return E.right(await paymentScheduleDatasource.addPayTrackPaymentScheduleDemand(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}

