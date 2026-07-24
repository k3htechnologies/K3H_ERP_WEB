import { Failure } from "@/core/api/FailureResponse";
import * as E from "fp-ts/Either";
import { JobRoleDatasourceImpl } from "../datasources/JobRoleDatasource";
import type {
  DeleteJobRoleRequest,
  FilterWithPaginationJobRoleRequest,
  JobDepartmentListResponse,
  JobRoleListResponse,
  JobRoleMutationResponse,
  JobRoleSaveRequest,
} from "../models/JobRoleModel";

const datasource = new JobRoleDatasourceImpl();

const toFailure = (error: unknown) =>
  new Failure(error instanceof Error ? error.message : undefined);

export const jobRoleService = {
  apiCallPullJobDepartments: async (
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, JobDepartmentListResponse>> => {
    try {
      return E.right(await datasource.pullJobDepartments(options?.signal));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallPullJobRoles: async (
    params: FilterWithPaginationJobRoleRequest,
    options?: { signal?: AbortSignal },
  ): Promise<E.Either<Failure, JobRoleListResponse>> => {
    try {
      return E.right(await datasource.pullJobRoles(params, options?.signal));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallAddUpdateJobRole: async (
    params: JobRoleSaveRequest,
  ): Promise<E.Either<Failure, JobRoleMutationResponse>> => {
    try {
      return E.right(await datasource.addUpdateJobRole(params));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },

  apiCallDeleteJobRole: async (
    params: DeleteJobRoleRequest,
  ): Promise<E.Either<Failure, JobRoleMutationResponse>> => {
    try {
      return E.right(await datasource.deleteJobRole(params));
    } catch (error: unknown) {
      return E.left(toFailure(error));
    }
  },
};
