import type { Failure } from '@/core/api/FailureResponse';
import { LeaveTypeMasterDatasourceImpl } from '@/features/leaveTypeMaster/datasources/LeaveTypeMasterDatasource'
import type {
    FilterWithPaginationLeaveTypeMasterRequest,
    AddUpdateLeaveTypeMasterRequest,
    DeleteLeaveTypeMasterRequest,
    LeaveTypeMasterListResponse,
    LeaveTypeMasterSaveResponse,
    LeaveTypeMasterDeleteResponse
} from '@/features/leaveTypeMaster/models/LeaveTypeMasterModel'

import * as E from 'fp-ts/Either';

const leaveTypeMasterDatasource = new LeaveTypeMasterDatasourceImpl();

export const LeaveTypeMasterService = {

    apiCallPullLeaveTypeMaster: async (params: FilterWithPaginationLeaveTypeMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveTypeMasterListResponse>> => {
        try {

            return E.right(await leaveTypeMasterDatasource.pullLeaveTypeMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLeaveTypeMaster: async (params: AddUpdateLeaveTypeMasterRequest): Promise<E.Either<Failure, LeaveTypeMasterSaveResponse>> => {
        try {

            return E.right(await leaveTypeMasterDatasource.addUpdateLeaveTypeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteLeaveTypeMaster: async (params: DeleteLeaveTypeMasterRequest): Promise<E.Either<Failure, LeaveTypeMasterDeleteResponse>> => {
        try {

            return E.right(await leaveTypeMasterDatasource.deleteLeaveTypeMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
