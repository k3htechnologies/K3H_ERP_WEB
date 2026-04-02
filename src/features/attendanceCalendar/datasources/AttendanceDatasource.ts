import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AttendanceApi } from '@/features/attendanceCalendar/api/AttendanceApi'
import type {
    FilterWithPaginationAttendanceRequest,
    AttendanceListResponse,
    AddUpdateAttendance,
    AttendanceSaveResponse
} from '@/features/attendanceCalendar/models/AttendanceModel'

export abstract class AttendanceDatasource {

    abstract pullAttendance(params: FilterWithPaginationAttendanceRequest, signal?: AbortSignal): Promise<AttendanceListResponse>;
    abstract addUpdateAttendance(params: AddUpdateAttendance): Promise<AttendanceSaveResponse>
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
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.IsReport !== undefined) queryParams.append('IsReport', params.IsReport.toString());
            if (params.CanApprove !== undefined) queryParams.append('CanApprove', params.CanApprove.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.IsCheckPermission) queryParams.append('IsCheckPermission', params.IsCheckPermission.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());

            return await this.k3hHttpClient.getRequestWithAuthentication(`${AttendanceApi.PULL}?${queryParams.toString()}`, { signal });

        } catch (error: any) {

            console.error('ERROR: PULL ATTENDANCE :', error);

            if (error instanceof TokenExpiredException) {
              return await this.pullAttendance(params);
            }

            throw error
        }
    }

    async addUpdateAttendance(params: AddUpdateAttendance): Promise<AttendanceSaveResponse> {
        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(AttendanceApi.ADD_UPDATE, params)

        } catch (error) {

            console.error('ERROR: ADD UPDATE ATTENDANCE :', error)

            if (error instanceof TokenExpiredException) {

               return await this.addUpdateAttendance(params);
            }
            throw error
        }
    }
}











































