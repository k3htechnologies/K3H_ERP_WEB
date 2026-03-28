import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { AttendanceRegularizationApi } from '@/features/attendanceCalendar/api/AttendanceRegularizationApi'
import type {
    FilterWithPaginationAttendanceRegularizationRequest,
    AddUpdateAttendanceRegularization,
    AttendanceRegularizationListResponse,
    AttendanceRegularizationSaveResponse,
} from '@/features/attendanceCalendar/models/AttendanceModel'

export abstract class AttendanceRegularizationDatasource {
    abstract pullAttendanceRegularization(params: FilterWithPaginationAttendanceRegularizationRequest, signal?: AbortSignal): Promise<AttendanceRegularizationListResponse>;
    abstract addUpdateAttendanceRegularization(data: AddUpdateAttendanceRegularization): Promise<AttendanceRegularizationSaveResponse>;
}

export class AttendanceRegularizationDatasourceImpl implements AttendanceRegularizationDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullAttendanceRegularization(
        params: FilterWithPaginationAttendanceRegularizationRequest,
        signal?: AbortSignal
    ): Promise<AttendanceRegularizationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                AttendanceRegularizationId: (params.AttendanceRegularizationId ?? 0).toString(),
            })

            if (params.StartDate?.trim()) queryParams.append('StartDate', params.StartDate.trim());
            if (params.EndDate?.trim()) queryParams.append('EndDate', params.EndDate.trim());
            if (params.EmployeeId !== undefined && params.EmployeeId !== null) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.IsReport !== undefined) queryParams.append('IsReport', params.IsReport.toString());
            if (params.CanApprove !== undefined) queryParams.append('CanApprove', params.CanApprove.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);
            if (params.IsCheckPermission) queryParams.append('IsCheckPermission', params.IsCheckPermission.toString());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${AttendanceRegularizationApi.PULL}?${queryParams.toString()}`,
                { signal }
            )
            return response;
        } catch (error: any) {
            console.error('ERROR: PULL ATTENDANCE REGULARIZATION :', error);

            if (error === TokenExpiredException) {
                return await this.pullAttendanceRegularization(params);
            }

            throw error
        }
    }

    async addUpdateAttendanceRegularization(
        params: AddUpdateAttendanceRegularization
    ): Promise<AttendanceRegularizationSaveResponse> {
        try {
            const payLoad: AddUpdateAttendanceRegularization = {
                AttendanceRegularizationId: params.AttendanceRegularizationId ?? 0,
                Uniquekey: params.Uniquekey && params.Uniquekey.trim() !== ''
                    ? params.Uniquekey.trim()
                    : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                AttendanceDate: params.AttendanceDate?.trim() || null,
                PunchIn: params.PunchIn?.trim() || null,
                PunchOut: params.PunchOut?.trim() || null,
                Reason: params.Reason?.trim() || null,
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                AttendanceRegularizationApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE ATTENDANCE REGULARIZATION :', error)

            if (error === TokenExpiredException) {
                return await this.addUpdateAttendanceRegularization(params);
            }
            throw error
        }
    }
}































