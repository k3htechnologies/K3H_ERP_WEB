import type { Failure } from "@/core/api/FailureResponse";
import { OTPLogsDatasourceImpl } from "@/features/oTPLogs/datasources/OTPLogsDataSource";
import type { FilterWithPaginationOTPLogsRequest, OTPLogsListResponse } from "@/features/oTPLogs/models/OTPLogsModel";
import * as E from 'fp-ts/Either';

const OTPLogsDatasource = new OTPLogsDatasourceImpl();

export const oTPLogsService = {

    apiCallPullOTPLogs: async (params: FilterWithPaginationOTPLogsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, OTPLogsListResponse>> => {

        try {
            return E.right(await OTPLogsDatasource.pullOTPLogs(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });
        }
    },
}