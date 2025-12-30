import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EmployeeMasterApi } from '@/features/employeeMaster/api/EmployeeMasterApi'
import type {
    FilterWithPaginationEmployeeExperienceDetailsRequest,
    EmployeeExperienceDetailsListResponse,
    DeleteEmployeeExperienceDetailsRequest,
    EmployeeExperienceDetailsDeleteResponse,
    EmployeeExperienceDetailsSaveResponse,
    AddUpdateEmployeeExperienceDetailsRequest,
} from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal'

export abstract class EmployeeExperienceDetailsDatasource {


    abstract pullEmployeeExperienceDetails(params: FilterWithPaginationEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsListResponse>;
    abstract addUpdateEmployeeExperienceDetails(params: AddUpdateEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsSaveResponse>;
    abstract deleteEmployeeExperienceDetails(params: DeleteEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsDeleteResponse>;
}

export class EmployeeExperienceDetailsDatasourceImpl implements EmployeeExperienceDetailsDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullEmployeeExperienceDetails(params: FilterWithPaginationEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeExperienceDetailsId) queryParams.append('EmployeeExperienceDetailsId', params.EmployeeExperienceDetailsId.toString());
            if (params.CompanyName?.trim()) queryParams.append('CompanyName', params.CompanyName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL_EMPLOYEE_EXPERIENCE_DETAILS}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull EMPLOYEE EXPERIENCE DETAILS :', error);

            if (error === TokenExpiredException) {
                await this.pullEmployeeExperienceDetails(params);
            }

            throw error
        }
    }

    async addUpdateEmployeeExperienceDetails(params: AddUpdateEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_EXPERIENCE_DETAILS,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update EMPLOYEE EXPERIENCE DETAILS:', error)

            if (error === TokenExpiredException) {

                await this.addUpdateEmployeeExperienceDetails(params);
            }
            throw error
        }
    }
    async deleteEmployeeExperienceDetails(params: DeleteEmployeeExperienceDetailsRequest): Promise<EmployeeExperienceDetailsDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EmployeeExperienceDetailsId: (params.EmployeeExperienceDetailsId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                EmployeeId: (params.EmployeeId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EmployeeMasterApi.DELETE_EMPLOYEE_EXPERIENCE_DETAILS}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE EMPLOYEE EXPERIENCE DETAILS:', error)

            if (error === TokenExpiredException) {
                await this.deleteEmployeeExperienceDetails(params);
            }

            throw error
        }
    }

}
