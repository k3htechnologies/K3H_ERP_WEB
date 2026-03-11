import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ProjectMasterApi } from '@/features/projectMaster/api/ProjectMasterApi'
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
} from '@/features/projectMaster/models/ProjectMasterModel'

export abstract class ProjectMasterDatasource {

    abstract pullProjectMaster(params: FilterWithPaginationProjectMasterRequest, signal?: AbortSignal): Promise<ProjectMasterListResponse>;
    abstract addUpdateProjectMaster(formData: FormData): Promise<ProjectMasterSaveResponse>;

    abstract pullProjectMasterWithEmployee(ProjectId: number, FullName?: string, signal?: AbortSignal): Promise<ProjectMasterWithEmployeeResponse>;
    abstract pullPaginationProjectMasterWithEmployee(PageSize: number, PageNumber: number, ProjectId: number, FullName?: string,DepartmentName?: string): Promise<ProjectMasterWithEmployeeResponse>;
    abstract addUpdateProjectMasterWithEmployee(params: AddUpdateProjectMasterWithEmployeeRequest): Promise<ProjectMasterWithEmployeeSaveResponse>;
    abstract deleteProjectMasterWithEmployee(params: DeleteProjectMasterWithEmployeeRequest): Promise<ProjectMasterWithEmployeeDeleteResponse>;

    abstract pullProjectMasterWithCompany(ProjectId: number, signal?: AbortSignal): Promise<ProjectMasterWithCompanyResponse>;
    abstract addUpdateProjectMasterWithCompany(params: AddUpdateProjectMasterWithCompanyRequest): Promise<ProjectMasterWithCompanySaveResponse>


    abstract pullProjectMasterWithBankDetails(ProjectId: number, signal?: AbortSignal): Promise<ProjectMasterWithBankDetailsResponse>;
    abstract addUpdateProjectMasterWithBankDetails(params: AddUpdateProjectMasterWithBankDetailsRequest): Promise<ProjectMasterWithBankDetailsSaveResponse>;
    abstract deleteProjectMasterWithBankDetails(params: DeleteProjectMasterWithBankDetailsRequest): Promise<ProjectMasterWithBankDetailsDeleteResponse>
}

export class ProjectMasterDatasourceImpl implements ProjectMasterDatasource {
    private get k3hHttpClient() {
        return baseClient
    }


    async pullProjectMaster(params: FilterWithPaginationProjectMasterRequest, signal?: AbortSignal): Promise<ProjectMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsProjectAccess: (params.IsProjectAccess ?? true).toString(),
            })
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.ProjectLocation) queryParams.append('ProjectLocation', params.ProjectLocation.toString());
            if (params.ProjectName?.trim()) queryParams.append('ProjectName', params.ProjectName.trim());
            if (params.CTCNumber?.trim()) queryParams.append('CTCNumber', params.CTCNumber.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullProjectMaster(params);
            }

            throw error
        }
    }

    async addUpdateProjectMaster(formData: FormData): Promise<ProjectMasterSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProjectMasterApi.ADD_UPDATE,
                formData
            );

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT MASTER :', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectMaster(formData);
            }
            throw error
        }
    }

    async pullProjectMasterWithEmployee(ProjectId: number, FullName?: string, signal?: AbortSignal): Promise<ProjectMasterWithEmployeeResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (ProjectId ?? 0).toString()
            })
            if (FullName) queryParams.append('FullName', FullName.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL_PROJECT_WITH_EMPLOYEE}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT MASTER WITH EMPLOYEE:', error);

            if (error === TokenExpiredException) {

                await this.pullProjectMasterWithEmployee(Number(ProjectId));
            }

            throw error
        }
    }

    async pullPaginationProjectMasterWithEmployee(PageSize: number, PageNumber: number, ProjectId: number, FullName?: string,DepartmentName?: string): Promise<ProjectMasterWithEmployeeResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (ProjectId ?? 0).toString(),
                PageSize: (PageSize ?? 20).toString(),
                PageNumber: (PageNumber ?? 1).toString()
            })
            if (FullName) queryParams.append('FullName', FullName.trim());
             if (DepartmentName) queryParams.append('DepartmentName', DepartmentName.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL_PAGINATION_PROJECT_WITH_EMPLOYEE}?${queryParams.toString()}`, {signal: undefined }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PAGINATION PROJECT MASTER WITH EMPLOYEE:', error);

            if (error === TokenExpiredException) {

                await this.pullPaginationProjectMasterWithEmployee(PageSize, PageNumber, Number(ProjectId));
            }

            throw error
        }
    }

    async addUpdateProjectMasterWithEmployee(params: AddUpdateProjectMasterWithEmployeeRequest): Promise<ProjectMasterWithEmployeeSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectMasterApi.ADD_UPDATE_PROJECT_WITH_EMPLOYEE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT MASTER WITH EMPLOYEE:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectMasterWithEmployee(params);
            }
            throw error
        }
    }

    async deleteProjectMasterWithEmployee(params: DeleteProjectMasterWithEmployeeRequest): Promise<ProjectMasterWithEmployeeDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                EmployeeId: params.EmployeeId ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectMasterApi.DELETE_PROJECT_WITH_EMPLOYEE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT MASTER WITH EMPLOYEE :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectMasterWithEmployee(params);

            }

            throw error
        }
    }

    async pullProjectMasterWithCompany(ProjectId: number, signal?: AbortSignal): Promise<ProjectMasterWithCompanyResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (ProjectId ?? 0).toString()
            })
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL_PROJECT_WITH_COMPANY}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL PROJECT MASTER WITH COMPANY:', error);

            if (error === TokenExpiredException) {

                await this.pullProjectMasterWithCompany(Number(ProjectId));
            }

            throw error
        }
    }

    async addUpdateProjectMasterWithCompany(params: AddUpdateProjectMasterWithCompanyRequest): Promise<ProjectMasterWithCompanySaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectMasterApi.ADD_UPDATE_PROJECT_WITH_COMPANY,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT MASTER WITH EMPLOYEE:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectMasterWithCompany(params);
            }
            throw error
        }
    }

    async pullProjectMasterWithBankDetails(ProjectId: number, signal?: AbortSignal): Promise<ProjectMasterWithBankDetailsResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectId: (ProjectId ?? 0).toString()
            })
            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProjectMasterApi.PULL_PROJECT_WITH_BANK_DETAILS}?${queryParams.toString()}`, { signal }
            )
            return response;

        } catch (error: any) {

            console.error('ERROR: PULL PROJECT MASTER WITH BANK DETAILS:', error);

            if (error === TokenExpiredException) {

                await this.pullProjectMasterWithBankDetails(Number(ProjectId));
            }

            throw error
        }
    }

    async addUpdateProjectMasterWithBankDetails(params: AddUpdateProjectMasterWithBankDetailsRequest): Promise<ProjectMasterWithBankDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProjectMasterApi.ADD_UPDATE_PROJECT_WITH_BANK_DETAILS,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE PROJECT MASTER WITH BANK DETAILS:', error)

            if (error === TokenExpiredException) {
                await this.addUpdateProjectMasterWithBankDetails(params);
            }
            throw error
        }
    }

    async deleteProjectMasterWithBankDetails(params: DeleteProjectMasterWithBankDetailsRequest): Promise<ProjectMasterWithBankDetailsDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                ProjectWithBankDetailsId: (params.ProjectWithBankDetailsId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProjectMasterApi.DELETE_PROJECT_WITH_BANK_DETAILS}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE PROJECT MASTER WITH BANK DETAILS :', error)

            if (error === TokenExpiredException) {

                await this.deleteProjectMasterWithBankDetails(params);

            }

            throw error
        }
    }


}
