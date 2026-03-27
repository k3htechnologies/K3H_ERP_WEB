import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { LeaveApi } from '@/features/leave/api/LeaveApi'
import type {
    AddUpdateLeaveRequest,
    DeleteLeaveRequest,
    FilterWithPaginationLeaveConfiguredRequest,
    FilterWithPaginationLeaveRequest,
    LeaveConfiguredListResponse,
    LeaveDeleteResponse,
    LeaveListResponse,
    LeaveSaveResponse,
} from '@/features/leave/models/LeaveModel'

export abstract class LeaveDatasource {

    abstract pullLeave(params: FilterWithPaginationLeaveRequest, signal?: AbortSignal): Promise<LeaveListResponse>;
    abstract addUpdateLeave(data: AddUpdateLeaveRequest): Promise<LeaveSaveResponse>;
    abstract deleteLeave(params: DeleteLeaveRequest): Promise<LeaveDeleteResponse>;
    abstract pullLeaveConfigured(params: FilterWithPaginationLeaveConfiguredRequest, signal?: AbortSignal): Promise<LeaveConfiguredListResponse>;
}

export class LeaveDatasourceImpl implements LeaveDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullLeave(params: FilterWithPaginationLeaveRequest, signal?: AbortSignal): Promise<LeaveListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })

            if (params.LeaveId) queryParams.append('LeaveId', params.LeaveId.toString())
            if (params.LeaveTypeMasterId) queryParams.append('LeaveTypeMasterId', params.LeaveTypeMasterId.toString())
            if (params.LeaveType?.trim()) queryParams.append('LeaveType', params.LeaveType.trim())
            if (params.StartDate?.trim()) queryParams.append('StartDate', params.StartDate.trim())
            if (params.EndDate?.trim()) queryParams.append('EndDate', params.EndDate.trim())
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim())
            if (params.EmployeeId !== undefined && params.EmployeeId !== null) queryParams.append('EmployeeId', params.EmployeeId.toString())
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.IsReport !== undefined) queryParams.append('IsReport', params.IsReport.toString())
            if (params.CanApprove !== undefined) queryParams.append('CanApprove', params.CanApprove.toString())
            if (params.IsCheckPermission !== undefined) queryParams.append('IsCheckPermission', params.IsCheckPermission.toString())

            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response
        } catch (error) {

            console.error('Error: Pull LEAVE:', error);

            if (error === TokenExpiredException) {
                return await this.pullLeave(params)
            }
            throw error
        }
    }

    async addUpdateLeave(params: AddUpdateLeaveRequest): Promise<LeaveSaveResponse> {

        try {

            const formData = new FormData();

            formData.append('LeaveId', String(params.LeaveId ?? 0))
            formData.append('Uniquekey', params.Uniquekey ?? '')
            formData.append('LeaveTypeMasterId', String(params.LeaveTypeMasterId ?? 0))
            formData.append('StartDate', params.StartDate ?? '')
            formData.append('EndDate', params.EndDate ?? '')
            formData.append('StartDateLeaveDuration', params.StartDateLeaveDuration ?? '')
            formData.append('EndDateLeaveDuration', params.EndDateLeaveDuration ?? '')
            formData.append('Reason', params.Reason ?? '')

            if (params.LeaveDocumentFiles && params.LeaveDocumentFiles.length > 0) {
                params.LeaveDocumentFiles.forEach((file) => {
                    if (file instanceof File) {
                        formData.append('LeaveDocumentURL', file);
                    }
                });

                const existingUrls = params.LeaveDocumentFiles
                    .filter(x => typeof x === 'string' && String(x).trim().length > 0)
                    .map(x => String(x).trim())
                    .join(',');

                if (existingUrls) {
                    formData.append('LeaveDocumentURL', existingUrls);
                }
            }

            formData.append('RemoveLeaveURL', params.RemoveLeaveURL ?? '')

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                LeaveApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {
            console.error('Error: Add Update LEAVE:', error)

            if (error === TokenExpiredException) {
                return await this.addUpdateLeave(params)
            }

            throw error
        }
    }

    async deleteLeave(params: DeleteLeaveRequest): Promise<LeaveDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                LeaveId: (params.LeaveId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${LeaveApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('Error: Delete LEAVE:', error)

            if (error === TokenExpiredException) {
                return await this.deleteLeave(params)
            }

            throw error
        }
    }

    async pullLeaveConfigured(params: FilterWithPaginationLeaveConfiguredRequest, signal?: AbortSignal): Promise<LeaveConfiguredListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            
            if (params.LeaveTypeMasterId) queryParams.append('LeaveTypeMasterId', params.LeaveTypeMasterId.toString())
            if (params.LeaveType?.trim()) queryParams.append('LeaveType', params.LeaveType.trim())

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${LeaveApi.PULL_LEAVE_CONFIGURED}?${queryParams.toString()}`, { signal }
            )
            return response
        } catch (error) {

            console.error('Error: Pull LEAVE CONFIGURED:', error);

            if (error === TokenExpiredException) {
                return await this.pullLeaveConfigured(params)
            }

            throw error
        }
    }
}

