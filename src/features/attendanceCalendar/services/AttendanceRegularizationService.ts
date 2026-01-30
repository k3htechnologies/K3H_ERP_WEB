import type { Failure } from '@/core/api/FailureResponse';
import { AttendanceRegularizationDatasourceImpl } from '@/features/attendanceCalendar/datasources/AttendanceRegularizationDatasource'
import type {
    FilterWithPaginationAttendanceRegularizationRequest,
    AddUpdateAttendanceRegularization,
    AttendanceRegularizationListResponse,
    AttendanceRegularizationSaveResponse,
} from '@/features/attendanceCalendar/models/AttendanceModel';

import * as E from 'fp-ts/Either';

const attendanceRegularizationDatasource = new AttendanceRegularizationDatasourceImpl();

export const attendanceRegularizationService = {
    apiCallPullAttendanceRegularization: async (
        params: FilterWithPaginationAttendanceRegularizationRequest,
        options?: { signal?: AbortSignal }
    ): Promise<E.Either<Failure, AttendanceRegularizationListResponse>> => {
        try {
            return E.right(await attendanceRegularizationDatasource.pullAttendanceRegularization(params, options?.signal));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },

    apiCallAddUpdateAttendanceRegularization: async (
        params: AddUpdateAttendanceRegularization
    ): Promise<E.Either<Failure, AttendanceRegularizationSaveResponse>> => {
        try {
            return E.right(await attendanceRegularizationDatasource.addUpdateAttendanceRegularization(params));
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code });
        }
    },
}






















