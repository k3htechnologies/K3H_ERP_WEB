import baseClient from "@/core/config/baseClient"
import { TokenExpiredException } from "@/core/config/baseClientexceptions"
import { JobRoleMasterApi } from "@/features/hireSpace/JobRoleMaster/api/JobRoleMasterApi"
import type {
    FilterWithPaginationJobRoleMasterRequest,
    AddUpdateJobRoleMasterRequest,
    DeleteJobRoleMasterRequest,
    JobDepartmentListResponse,
    JobRoleMasterListResponse,
    JobRoleMasterSaveResponse,
    JobRoleMasterDeleteResponse
} from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel'

export abstract class JobRoleMasterDatasource {

    abstract pullJobDepartment(signal?: AbortSignal): Promise<JobDepartmentListResponse>
    abstract pullJobRoleMaster(params: FilterWithPaginationJobRoleMasterRequest, signal?: AbortSignal): Promise<JobRoleMasterListResponse>
    abstract addUpdateJobRoleMaster(data: AddUpdateJobRoleMasterRequest): Promise<JobRoleMasterSaveResponse>
    abstract deleteJobRoleMaster(params: DeleteJobRoleMasterRequest): Promise<JobRoleMasterDeleteResponse>
}

export class JobRoleMasterDatasourceImpl implements JobRoleMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullJobDepartment(signal?: AbortSignal): Promise<JobDepartmentListResponse> {
        try {
            return await this.k3hHttpClient.getRequestWithAuthentication(
                JobRoleMasterApi.PULL_DEPARTMENTS, { signal }
            )

        } catch (error: any) {
            console.error('ERROR: PULL JOB DEPARTMENT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullJobDepartment(signal)
            }
            throw error
        }
    }

    async pullJobRoleMaster(params: FilterWithPaginationJobRoleMasterRequest, signal?: AbortSignal): Promise<JobRoleMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                pageSize: (params.PageSize ?? 10).toString(),
                pageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.JobRoleId) queryParams.append('JobRoleId', params.JobRoleId.toString())
            if (params.DepartmentId) queryParams.append('DepartmentId', params.DepartmentId.toString())
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim())
            if (params.RoleName?.trim()) queryParams.append('RoleName', params.RoleName.trim())
            if (params.RoleSkills?.trim()) queryParams.append('RoleSkills', params.RoleSkills.trim())
            if (params.IsActive !== undefined) queryParams.append('IsActive', params.IsActive.toString())
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return  await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobRoleMasterApi.PULL}?${queryParams.toString()}`,{ signal }
            )


        } catch (error: any) {
            console.error('ERROR: PULL JOB ROLE MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullJobRoleMaster(params)
            }
            throw error
        }
    }

    async addUpdateJobRoleMaster(params: AddUpdateJobRoleMasterRequest): Promise<JobRoleMasterSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                JobRoleMasterApi.ADD_UPDATE,
                params
            )

        } catch (error) {
            console.error('ERROR: ADD UPDATE JOB ROLE MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateJobRoleMaster(params)
            }
            throw error
        }
    }

    async deleteJobRoleMaster(params: DeleteJobRoleMasterRequest): Promise<JobRoleMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                JobRoleId: (params.JobRoleId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${JobRoleMasterApi.DELETE}?${queryParams.toString()}`
            )

        } catch (error) {
            console.error('ERROR: DELETE JOB ROLE MASTER :', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteJobRoleMaster(params)
            }
            throw error
        }
    }
}
