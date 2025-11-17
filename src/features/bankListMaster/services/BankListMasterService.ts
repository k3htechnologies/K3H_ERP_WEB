import type { Failure } from '@/core/api/FailureResponse';
import { BankListMasterDatasourceImpl } from '@/features/bankListMaster/datasources/BankListMasterDatasource'
import type {
    FilterWithPaginationBankListMasterRequest,
    BankListMasterListResponse,
} from '@/features/bankListMaster/models/BankListMasterModel';

import * as E from 'fp-ts/Either';

const bankListMasterDatasource = new BankListMasterDatasourceImpl();

export const BankListMasterService = {

    apiCallPullBankListMaster: async (params: FilterWithPaginationBankListMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, BankListMasterListResponse>> => {
        try {

            return E.right(await bankListMasterDatasource.pullBankListMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }
}
