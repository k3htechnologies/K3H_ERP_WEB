import type { Failure } from '@/core/api/FailureResponse';
import { LeaveDatasourceImpl } from '@/features/leave/datasources/LeaveDatasource';
import type {
    AddUpdateLeaveRequest,
    DeleteLeaveRequest,
    FilterWithPaginationLeaveConfiguredRequest,
    FilterWithPaginationLeaveRequest,
    LeaveConfiguredListResponse,
    LeaveDeleteResponse,
    LeaveListResponse,
    LeaveSaveResponse,
} from '@/features/leave/models/LeaveModel';

import * as E from 'fp-ts/Either';

const leaveDatasource = new LeaveDatasourceImpl();

export const LeaveService = {

    apiCallPullLeave: async (params: FilterWithPaginationLeaveRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveListResponse>> => {
        try {

            return E.right(await leaveDatasource.pullLeave(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLeave: async (params: AddUpdateLeaveRequest): Promise<E.Either<Failure, LeaveSaveResponse>> => {
        try {

            return E.right(await leaveDatasource.addUpdateLeave(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteLeave: async (params: DeleteLeaveRequest): Promise<E.Either<Failure, LeaveDeleteResponse>> => {
        try {

            return E.right(await leaveDatasource.deleteLeave(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

      apiCallPullLeaveConfigured: async (params: FilterWithPaginationLeaveConfiguredRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveConfiguredListResponse>> => {
        try {

            return E.right(await leaveDatasource.pullLeaveConfigured(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}