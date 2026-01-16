import type { Failure } from '@/core/api/FailureResponse';
import { LeaveEncashmentMasterDatasourceImpl } from '@/features/leaveEncashmentMaster/datasources/LeaveEncashmentMasterDatasource'
import type {
    FilterWithPaginationLeaveEncashmentMasterRequest,
    AddUpdateLeaveEncashmentMasterRequest,
    DeleteLeaveEncashmentMasterRequest,
    LeaveEncashmentMasterListResponse,
    LeaveEncashmentMasterSaveResponse,
    LeaveEncashmentMasterDeleteResponse
} from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel'

import * as E from 'fp-ts/Either';

const leaveEncashmentMasterDatasource = new LeaveEncashmentMasterDatasourceImpl();

export const leaveEncashmentMasterService = {

    apiCallPullLeaveEncashmentMaster: async (params: FilterWithPaginationLeaveEncashmentMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, LeaveEncashmentMasterListResponse>> => {
        try {

            return E.right(await leaveEncashmentMasterDatasource.pullLeaveEncashmentMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateLeaveEncashmentMaster: async (params: AddUpdateLeaveEncashmentMasterRequest): Promise<E.Either<Failure, LeaveEncashmentMasterSaveResponse>> => {
        try {

            return E.right(await leaveEncashmentMasterDatasource.addUpdateLeaveEncashmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteLeaveEncashmentMaster: async (params: DeleteLeaveEncashmentMasterRequest): Promise<E.Either<Failure, LeaveEncashmentMasterDeleteResponse>> => {
        try {

            return E.right(await leaveEncashmentMasterDatasource.deleteLeaveEncashmentMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
