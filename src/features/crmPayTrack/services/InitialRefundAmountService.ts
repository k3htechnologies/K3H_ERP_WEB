import type { Failure } from '@/core/api/FailureResponse';
import { InitialRefundAmountDatasourceImpl } from '@/features/crmPayTrack/datasources/InitialRefundAmountDatasource'
import type {
    AddUpdateRefundAmountData,
    AddUpdateRefundAmountResponse
} from '@/features/crmPayTrack/models/InitialRefundAmountModel';

import * as E from 'fp-ts/Either';

export abstract class InitialRefundAmountService {
    abstract apiCallAddUpdateRefundAmount(data: AddUpdateRefundAmountData): Promise<E.Either<Failure, AddUpdateRefundAmountResponse>>;
}

const initialRefundAmountCrmDatasource = new InitialRefundAmountDatasourceImpl();

export const initialRefundAmountService = {

    apiCallAddUpdateRefundAmount: async (params: AddUpdateRefundAmountData): Promise<E.Either<Failure, AddUpdateRefundAmountResponse>> => {
        try {

            return E.right(await initialRefundAmountCrmDatasource.addUpdateRefundAmount(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}


