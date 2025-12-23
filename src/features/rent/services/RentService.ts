import type { Failure } from '@/core/api/FailureResponse';
import { RentDatasourceImpl } from '@/features/rent/datasources/RentDatasource'
import type { TenantApplicantChargesListResponse, FilterWithPaginationTenantApplicantChargesRequest } from '@/features/rent/models/RentModel';

import * as E from 'fp-ts/Either';

const rentDatasource = new RentDatasourceImpl();

export const rentService = {

    apiCallPullTenantApplicantCharges: async (params: FilterWithPaginationTenantApplicantChargesRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, TenantApplicantChargesListResponse>> => {
        try {

            return E.right(await rentDatasource.pullTenantApplicantCharges(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    }

}
