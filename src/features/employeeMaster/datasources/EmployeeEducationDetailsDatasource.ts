import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EmployeeMasterApi } from '@/features/employeeMaster/api/EmployeeMasterApi'
import type {
    FilterWithPaginationEmployeeEducationDetailsRequest,
    EmployeeEducationDetailsListResponse,
    DeleteEmployeeEducationDetailsRequest,
    EmployeeEducationDetailsDeleteResponse,
    EmployeeEducationDetailsSaveResponse,
    AddUpdateEmployeeEducationDetailsRequest,
} from '@/features/employeeMaster/models/EmployeeEducationDetailsModel'

export abstract class EmployeeEducationDetailsDatasource {


    abstract pullEmployeeEducationDetails(params: FilterWithPaginationEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsListResponse>;
    abstract addUpdateEmployeeEducationDetails(params: AddUpdateEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsSaveResponse>;
    abstract deleteEmployeeEducationDetails(params: DeleteEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsDeleteResponse>;
}

export class EmployeeEducationDetailsDatasourceImpl implements EmployeeEducationDetailsDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullEmployeeEducationDetails(params: FilterWithPaginationEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeEducationDetailsId) queryParams.append('EmployeeEducationDetailsId', params.EmployeeEducationDetailsId.toString());
            if (params.Qualification?.trim()) queryParams.append('Qualification', params.Qualification.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL_EMPLOYEE_EDUCATION_DETAILS}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull EMPLOYEE EDUCATION DETAILS :', error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullEmployeeEducationDetails(params);
            }

            throw error
        }
    }

    async addUpdateEmployeeEducationDetails(params: AddUpdateEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_EDUCATION_DETAILS,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update EMPLOYEE EDUCATION DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return   await this.addUpdateEmployeeEducationDetails(params);
            }
            throw error
        }
    }
    async deleteEmployeeEducationDetails(params: DeleteEmployeeEducationDetailsRequest): Promise<EmployeeEducationDetailsDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EmployeeEducationDetailsId: (params.EmployeeEducationDetailsId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                EmployeeId: (params.EmployeeId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EmployeeMasterApi.DELETE_EMPLOYEE_EDUCATION_DETAILS}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE EMPLOYEE EDUCATION DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return  await this.deleteEmployeeEducationDetails(params);
            }

            throw error
        }
    }

}
