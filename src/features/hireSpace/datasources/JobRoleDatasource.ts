import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { JobRoleApi } from "../api/JobRoleApi";
import type {
  DeleteJobRoleRequest,
  FilterWithPaginationJobRoleRequest,
  JobDepartmentListResponse,
  JobRoleListResponse,
  JobRoleMutationResponse,
  JobRoleSaveRequest,
} from "../models/JobRoleModel";

export abstract class JobRoleDatasource {
  abstract pullJobDepartments(
    signal?: AbortSignal,
  ): Promise<JobDepartmentListResponse>;
  abstract pullJobRoles(
    params: FilterWithPaginationJobRoleRequest,
    signal?: AbortSignal,
  ): Promise<JobRoleListResponse>;
  abstract addUpdateJobRole(
    params: JobRoleSaveRequest,
  ): Promise<JobRoleMutationResponse>;
  abstract deleteJobRole(
    params: DeleteJobRoleRequest,
  ): Promise<JobRoleMutationResponse>;
}

export class JobRoleDatasourceImpl implements JobRoleDatasource {
  private get k3hHttpClient() {
    return baseClient;
  }

  async pullJobDepartments(
    signal?: AbortSignal,
  ): Promise<JobDepartmentListResponse> {
    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(
        JobRoleApi.PULL_DEPARTMENT,
        { signal },
      );
    } catch (error: unknown) {
      if (!signal?.aborted)
        console.error("ERROR: PULL JOB DEPARTMENTS:", error);
      if (error instanceof TokenExpiredException)
        return this.pullJobDepartments(signal);
      throw error;
    }
  }

  async pullJobRoles(
    params: FilterWithPaginationJobRoleRequest,
    signal?: AbortSignal,
  ): Promise<JobRoleListResponse> {
    const queryParams = new URLSearchParams({
      PageSize: String(params.PageSize ?? 10),
      PageNumber: String(params.PageNumber ?? 1),
    });
    if (params.JobRoleId)
      queryParams.append("JobRoleId", String(params.JobRoleId));
    if (params.DepartmentId)
      queryParams.append("DepartmentId", String(params.DepartmentId));
    if (params.DepartmentName)
      queryParams.append("DepartmentName", params.DepartmentName);
    if (params.RoleName) queryParams.append("RoleName", params.RoleName);
    if (params.RoleSkills) queryParams.append("RoleSkills", params.RoleSkills);
    if (params.IsActive !== undefined)
      queryParams.append("IsActive", String(params.IsActive));
    if (params.SortBy) queryParams.append("SortBy", params.SortBy);
    if (params.ExportType) queryParams.append("ExportType", params.ExportType);

    try {
      return await this.k3hHttpClient.getRequestWithAuthentication(
        `${JobRoleApi.PULL_JOB_ROLES}?${queryParams.toString()}`,
        { signal },
      );
    } catch (error: unknown) {
      if (!signal?.aborted)
        console.error("ERROR: PULL JOB ROLES:", error);
      if (error instanceof TokenExpiredException)
        return this.pullJobRoles(params, signal);
      throw error;
    }
  }

  async addUpdateJobRole(
    params: JobRoleSaveRequest,
  ): Promise<JobRoleMutationResponse> {
    try {
      return await this.k3hHttpClient.postRequestWithAuthentication(
        JobRoleApi.ADD_UPDATE_JOB_ROLE,
        params,
      );
    } catch (error: unknown) {
      console.error("ERROR: ADD/UPDATE JOB ROLE:", error);
      if (error instanceof TokenExpiredException)
        return this.addUpdateJobRole(params);
      throw error;
    }
  }

  async deleteJobRole(
    params: DeleteJobRoleRequest,
  ): Promise<JobRoleMutationResponse> {
    const queryParams = new URLSearchParams({
      JobRoleId: String(params.JobRoleId),
      UniqueKey: params.UniqueKey,
    });
    try {
      return await this.k3hHttpClient.deleteRequestWithAuthentication(
        `${JobRoleApi.DELETE_JOB_ROLE}?${queryParams.toString()}`,
      );
    } catch (error: unknown) {
      console.error("ERROR: DELETE JOB ROLE:", error);
      if (error instanceof TokenExpiredException)
        return this.deleteJobRole(params);
      throw error;
    }
  }
}
