import type { Failure } from '@/core/api/FailureResponse';
import { ProjectMasterDatasourceImpl } from '@/features/projectMaster/datasources/ProjectMasterDatasource'
import type {
    FilterWithPaginationProjectMasterRequest,
    ProjectMasterListResponse,
    ProjectMasterSaveResponse,
    ProjectMasterWithBankDetailsResponse,
    ProjectMasterWithCompanyResponse,
    ProjectMasterWithEmployeeResponse,
} from '@/features/projectMaster/models/ProjectMasterModel';

import * as E from 'fp-ts/Either';

const projectMasterDatasource = new ProjectMasterDatasourceImpl();

export const ProjectMasterService = {

    apiCallPullProjectMaster: async (params: FilterWithPaginationProjectMasterRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterListResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMaster(params, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectMaster: async (formData: FormData): Promise<E.Either<Failure, ProjectMasterSaveResponse>> => {
        try {

            return E.right(await projectMasterDatasource.addUpdateProjectMaster(formData));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
    apiCallPullProjectMasterWithEmployee: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterWithEmployeeResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMasterWithEmployee(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
    apiCallPullProjectMasterWithCompany: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterWithCompanyResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMasterWithCompany(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
    apiCallPullProjectMasterWithBankDetails: async (ProjectId: number, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterWithBankDetailsResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMasterWithBankDetails(ProjectId, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
