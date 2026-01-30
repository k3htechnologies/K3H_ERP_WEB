import type { Failure } from '@/core/api/FailureResponse';
import { AttendanceDatasourceImpl } from '@/features/attendanceCalendar/datasources/AttendanceDatasource'
import type {
    FilterWithPaginationAttendanceRequest,
    AttendanceListResponse
} from '@/features/attendanceCalendar/models/AttendanceModel';

import * as E from 'fp-ts/Either';

const attendanceDatasource = new AttendanceDatasourceImpl();

export const attendanceService = {

    apiCallPullAttendance: async (params: FilterWithPaginationAttendanceRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AttendanceListResponse>> => {
        try {

            return E.right(await attendanceDatasource.pullAttendance(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}








































