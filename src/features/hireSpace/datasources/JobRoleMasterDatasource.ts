import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { JobRoleMasterApi } from '@/features/hireSpace/api/JobRoleMasterApi'
import type {
    FilterWithPaginationJobRoleMasterRequest,
    AddUpdateJobRoleMasterRequest,
    DeleteJobRoleMasterRequest,
    JobDepartmentListResponse,
    JobRoleMasterListResponse,
    JobRoleMasterSaveResponse,
    JobRoleMasterDeleteResponse
} from '@/features/hireSpace/models/JobRoleMasterModel'

export abstract class JobRoleMasterDatasource {

    abstract pullJobDepartments(signal?: AbortSignal): Promise<JobDepartmentListResponse>;
    abstract pullJobRoleMaster(params: FilterWithPaginationJobRoleMasterRequest, signal?: AbortSignal): Promise<JobRoleMasterListResponse>;
    abstract addUpdateJobRoleMaster(data: AddUpdateJobRoleMasterRequest): Promise<JobRoleMasterSaveResponse>;
    abstract deleteJobRoleMaster(params: DeleteJobRoleMasterRequest): Promise<JobRoleMasterDeleteResponse>;
}

export class JobRoleMasterDatasourceImpl implements JobRoleMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullJobDepartments(signal?: AbortSignal): Promise<JobDepartmentListResponse> {
        try {
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                JobRoleMasterApi.PULL_DEPARTMENTS, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL JOB DEPARTMENTS :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullJobDepartments();
            }
            throw error
        }
    }

    async pullJobRoleMaster(params: FilterWithPaginationJobRoleMasterRequest, signal?: AbortSignal): Promise<JobRoleMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.JobRoleId) queryParams.append('JobRoleId', params.JobRoleId.toString());
            if (params.DepartmentId) queryParams.append('DepartmentId', params.DepartmentId.toString());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.RoleName?.trim()) queryParams.append('RoleName', params.RoleName.trim());
            if (params.RoleSkills?.trim()) queryParams.append('RoleSkills', params.RoleSkills.trim());
            if (params.IsActive !== undefined) queryParams.append('IsActive', params.IsActive.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${JobRoleMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: unknown) {

            console.error('ERROR: PULL JOB ROLES :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullJobRoleMaster(params);
            }
            throw error
        }
    }

    async addUpdateJobRoleMaster(params: AddUpdateJobRoleMasterRequest): Promise<JobRoleMasterSaveResponse> {

        try {

            const payLoad: AddUpdateJobRoleMasterRequest = {
                JobRoleId: params.JobRoleId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
                DepartmentId: params.DepartmentId ?? 0,
                RoleName: params.RoleName.trim(),
                RoleDescription: params.RoleDescription.trim(),
                RoleQualification: params.RoleQualification.trim(),
                RoleResponsibility: params.RoleResponsibility.trim(),
                JobRequirement: params.JobRequirement.trim(),
                RoleSkills: params.RoleSkills.trim(),
                IsCopy: params.IsCopy ?? '0'
            }

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                JobRoleMasterApi.ADD_UPDATE,
                payLoad
            )

            return response
        } catch (error) {
            console.error('ERROR: ADD UPDATE JOB ROLE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateJobRoleMaster(params);
            }
            throw error
        }
    }

    async deleteJobRoleMaster(params: DeleteJobRoleMasterRequest): Promise<JobRoleMasterDeleteResponse> {
        try {
            const payload: DeleteJobRoleMasterRequest = {
                JobRoleId: params.JobRoleId ?? 0,
                UniqueKey: params.UniqueKey ?? '',
            }

            const response = await this.k3hHttpClient.deleteRequestWithAuthenticationBody(
                JobRoleMasterApi.DELETE,
                payload
            )

            return response

        } catch (error) {
            console.error('ERROR: DELETE JOB ROLE :', error);

            if (error instanceof TokenExpiredException) {

                return await this.deleteJobRoleMaster(params);

            }
            throw error
        }
    }
}
