import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { JobOpeningApi } from "@/features/hireSpace/jobOpening/api/JobOpeningApi"
import type {
    FilterWithPaginationJobOpeningRequest,
    AddUpdateJobOpeningRequest,
    DeleteJobOpeningRequest,
    JobOpeningListResponse,
    JobOpeningSaveResponse,
    JobOpeningDeleteResponse
} from '@/features/hireSpace/jobOpening/models/JobOpeningModel'

export abstract class JobOpeningDatasource {

    abstract pullJobOpening(params: FilterWithPaginationJobOpeningRequest, signal?: AbortSignal): Promise<JobOpeningListResponse>
    abstract addUpdateJobOpening(data: AddUpdateJobOpeningRequest): Promise<JobOpeningSaveResponse>
    abstract deleteJobOpening(params: DeleteJobOpeningRequest): Promise<JobOpeningDeleteResponse>
}

export class JobOpeningDatasourceImpl implements JobOpeningDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullJobOpening(params: FilterWithPaginationJobOpeningRequest, signal?: AbortSignal): Promise<JobOpeningListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: params.PageSize.toString(),
                pageNumber: params.PageNumber.toString(),
            })

            if (params.JobOpeningMasterId) queryParams.append('JobOpeningMasterId', params.JobOpeningMasterId.toString())
            if (params.DepartmentMasterId) queryParams.append('DepartmentMasterId', params.DepartmentMasterId.toString())
            if (params.JobRoleMasterId) queryParams.append('JobRoleMasterId', params.JobRoleMasterId.toString())
            if (params.WorkMode?.trim()) queryParams.append('WorkMode', params.WorkMode.trim())
            if (params.EmploymentType?.trim()) queryParams.append('EmploymentType', params.EmploymentType.trim())
            if (params.ExperienceYears) queryParams.append('ExperienceYears', params.ExperienceYears.toString())
            if (params.RoleName?.trim()) queryParams.append('RoleName', params.RoleName.trim())
            if (params.JobRoleStatus !== undefined) queryParams.append('JobRoleStatus', params.JobRoleStatus.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobOpeningApi.PULL}?${queryParams.toString()}`,
                { signal }
            )

            return response;
        } catch (error: any) {
            console.error('ERROR: PULL JOB OPENING :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullJobOpening(params)
            }
            throw error
        }
    }

    async addUpdateJobOpening(params: AddUpdateJobOpeningRequest): Promise<JobOpeningSaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobOpeningApi.ADD_UPDATE,
                params
            )

            return response;
        } catch (error) {
            console.error('ERROR: ADD UPDATE JOB OPENING :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateJobOpening(params)
            }
            throw error
        }
    }

    async deleteJobOpening(params: DeleteJobOpeningRequest): Promise<JobOpeningDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                JobOpeningMasterId: (params.JobOpeningMasterId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${JobOpeningApi.DELETE}?${queryParams.toString()}`
            )

            return response;
        } catch (error) {
            console.error('ERROR: DELETE JOB OPENING :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteJobOpening(params)
            }
            throw error
        }
    }
}
