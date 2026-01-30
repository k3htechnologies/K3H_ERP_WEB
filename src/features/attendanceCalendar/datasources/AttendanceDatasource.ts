import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AttendanceApi } from '@/features/attendanceCalendar/api/AttendanceApi'
import type {
    FilterWithPaginationAttendanceRequest,
    AttendanceListResponse
} from '@/features/attendanceCalendar/models/AttendanceModel'

export abstract class AttendanceDatasource {

    abstract pullAttendance(params: FilterWithPaginationAttendanceRequest, signal?: AbortSignal): Promise<AttendanceListResponse>;
}

export class AttendanceDatasourceImpl implements AttendanceDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullAttendance(params: FilterWithPaginationAttendanceRequest, signal?: AbortSignal): Promise<AttendanceListResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (params.PageSize !== undefined) queryParams.append('PageSize', params.PageSize.toString());
            if (params.PageNumber !== undefined) queryParams.append('PageNumber', params.PageNumber.toString());
            if (params.AttendanceId !== undefined) queryParams.append('AttendanceId', params.AttendanceId.toString());
            if (params.StartDate?.trim()) queryParams.append('StartDate', params.StartDate.trim());
            if (params.EndDate?.trim()) queryParams.append('EndDate', params.EndDate.trim());
            if (params.ApiKey?.trim()) queryParams.append('ApiKey', params.ApiKey.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AttendanceApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ATTENDANCE :', error);

            if (error === TokenExpiredException) {
                await this.pullAttendance(params);
            }

            throw error
        }
    }
}








































