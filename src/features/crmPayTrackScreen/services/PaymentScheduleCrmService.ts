import type { Failure } from '@/core/api/FailureResponse';
import { PaymentScheduleCrmDatasourceImpl } from '@/features/crmPayTrackScreen/datasources/PaymentScheduleCrmDatasource';
import type { FilterWithPaginationPaymentScheduleCrm, PaymentScheduleCrmListResponse } from '@/features/crmPayTrackScreen/models/PaymentScheduleCrmModel';
import * as E from 'fp-ts/Either';

const paymentScheduleCrmDatasource = new PaymentScheduleCrmDatasourceImpl();

export const paymentScheduleCrmService = {

    apiCallPullPaymentScheduleCrm: async (params: FilterWithPaginationPaymentScheduleCrm, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PaymentScheduleCrmListResponse>> => {

        try {

            return E.right(await paymentScheduleCrmDatasource.pullPaymentScheduleCrm(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}

