import type { Failure } from '@/core/api/FailureResponse';
import { ProjectMasterDatasourceImpl } from '@/features/projectMaster/datasources/ProjectMasterDatasource'
import type {
    AddUpdateProjectMasterWithBankDetailsRequest,
    AddUpdateProjectMasterWithCompanyRequest,
    AddUpdateProjectMasterWithEmployeeRequest,
    DeleteProjectMasterWithBankDetailsRequest,
    DeleteProjectMasterWithEmployeeRequest,
    FilterWithPaginationProjectMasterRequest,
    ProjectMasterListResponse,
    ProjectMasterSaveResponse,
    ProjectMasterWithBankDetailsDeleteResponse,
    ProjectMasterWithBankDetailsResponse,
    ProjectMasterWithBankDetailsSaveResponse,
    ProjectMasterWithCompanyResponse,
    ProjectMasterWithCompanySaveResponse,
    ProjectMasterWithEmployeeDeleteResponse,
    ProjectMasterWithEmployeeResponse,
    ProjectMasterWithEmployeeSaveResponse,
} from '@/features/projectMaster/models/ProjectMasterModel';

import * as E from 'fp-ts/Either';

const projectMasterDatasource = new ProjectMasterDatasourceImpl();

export const projectMasterService = {

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
    apiCallPullProjectMasterWithEmployee: async (ProjectId: number, FullName?: string, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterWithEmployeeResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMasterWithEmployee(ProjectId, FullName, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullPaginationProjectMasterWithEmployee: async (PageSize: number, PageNumber: number, ProjectId: number, FullName?: string,DepartmentName?: string): Promise<E.Either<Failure, ProjectMasterWithEmployeeResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullPaginationProjectMasterWithEmployee(PageSize, PageNumber, ProjectId, FullName,DepartmentName));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectMasterWithEmployee: async (params: AddUpdateProjectMasterWithEmployeeRequest): Promise<E.Either<Failure, ProjectMasterWithEmployeeSaveResponse>> => {
        try {

            return E.right(await projectMasterDatasource.addUpdateProjectMasterWithEmployee(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectMasterWithEmployee: async (params: DeleteProjectMasterWithEmployeeRequest): Promise<E.Either<Failure, ProjectMasterWithEmployeeDeleteResponse>> => {
        try {

            return E.right(await projectMasterDatasource.deleteProjectMasterWithEmployee(params));

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

    apiCallAddUpdateProjectMasterWithCompany: async (params: AddUpdateProjectMasterWithCompanyRequest): Promise<E.Either<Failure, ProjectMasterWithCompanySaveResponse>> => {
        try {

            return E.right(await projectMasterDatasource.addUpdateProjectMasterWithCompany(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallPullProjectMasterWithBankDetails: async (ProjectId: number,BankName?:string,isCheckPermission?:boolean, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProjectMasterWithBankDetailsResponse>> => {
        try {

            return E.right(await projectMasterDatasource.pullProjectMasterWithBankDetails(ProjectId,BankName,isCheckPermission, options?.signal));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallAddUpdateProjectMasterWithBankDetails: async (params: AddUpdateProjectMasterWithBankDetailsRequest): Promise<E.Either<Failure, ProjectMasterWithBankDetailsSaveResponse>> => {
        try {

            return E.right(await projectMasterDatasource.addUpdateProjectMasterWithBankDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },

    apiCallDeleteProjectMasterWithBankDetails: async (params: DeleteProjectMasterWithBankDetailsRequest): Promise<E.Either<Failure, ProjectMasterWithBankDetailsDeleteResponse>> => {
        try {

            return E.right(await projectMasterDatasource.deleteProjectMasterWithBankDetails(params));

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code });

        }
    },
}
