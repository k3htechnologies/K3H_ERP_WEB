import type { Failure } from '@/core/api/FailureResponse';
import type {
    FilterWithPaginationJobRoleMasterRequest,
    AddUpdateJobRoleMasterRequest,
    DeleteJobRoleMasterRequest,
    JobDepartmentListResponse,
    JobRoleMasterListResponse,
    JobRoleMasterSaveResponse,
    JobRoleMasterDeleteResponse
} from '@/features/hireSpace/models/JobRoleMasterModel'
import * as E from 'fp-ts/Either';
import { JobRoleMasterDatasourceImpl } from '@/features/hireSpace/datasources/JobRoleMasterDatasource';

const jobRoleMasterDatasource = new JobRoleMasterDatasourceImpl();

export const jobRoleMasterService = {

    apiCallPullJobDepartments: async (options?: { signal?: AbortSignal }): Promise<E.Either<Failure, JobDepartmentListResponse>> => {
        try {

            return E.right(await jobRoleMasterDatasource.pullJobDepartments(options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullJobRoleMaster: async (params: FilterWithPaginationJobRoleMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, JobRoleMasterListResponse>> => {
        try {

            return E.right(await jobRoleMasterDatasource.pullJobRoleMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateJobRoleMaster: async (params: AddUpdateJobRoleMasterRequest): Promise<E.Either<Failure, JobRoleMasterSaveResponse>> => {
        try {

            return E.right(await jobRoleMasterDatasource.addUpdateJobRoleMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteJobRoleMaster: async (params: DeleteJobRoleMasterRequest): Promise<E.Either<Failure, JobRoleMasterDeleteResponse>> => {
        try {

            return E.right(await jobRoleMasterDatasource.deleteJobRoleMaster(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
