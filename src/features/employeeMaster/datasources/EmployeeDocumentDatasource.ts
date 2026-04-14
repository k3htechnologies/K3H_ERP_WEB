import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { EmployeeMasterApi } from '@/features/employeeMaster/api/EmployeeMasterApi'
import type {
    FilterWithPaginationEmployeeDocumentRequest,
    EmployeeDocumentListResponse,
    DeleteEmployeeDocumentRequest,
    EmployeeDocumentDeleteResponse,
    EmployeeDocumentSaveResponse,
} from '@/features/employeeMaster/models/EmployeeDocumentModel'

export abstract class EmployeeDocumentDatasource {


    abstract pullEmployeeDocument(params: FilterWithPaginationEmployeeDocumentRequest): Promise<EmployeeDocumentListResponse>;
    abstract addUpdateEmployeeDocument(params: FormData): Promise<EmployeeDocumentSaveResponse>;
    abstract deleteEmployeeDocument(params: DeleteEmployeeDocumentRequest): Promise<EmployeeDocumentDeleteResponse>;
}

export class EmployeeDocumentDatasourceImpl implements EmployeeDocumentDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullEmployeeDocument(params: FilterWithPaginationEmployeeDocumentRequest): Promise<EmployeeDocumentListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeDocumentId) queryParams.append('EmployeeDocumentId', params.EmployeeDocumentId.toString());
            if (params.DocumentName?.trim()) queryParams.append('DocumentName', params.DocumentName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeMasterApi.PULL_EMPLOYEE_DOCUMENT}?${queryParams.toString()}`
            )

            return response
        } catch (error) {

            console.error('Error: Pull EMPLOYEE DOCUMENT :', error);

            if (error instanceof TokenExpiredException) {

                return   await this.pullEmployeeDocument(params);
            }

            throw error
        }
    }

    async addUpdateEmployeeDocument(params: FormData): Promise<EmployeeDocumentSaveResponse> {

        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                EmployeeMasterApi.ADD_UPDATE_EMPLOYEE_DOCUMENT,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update EMPLOYEE DOCUMENT:', error)

            if (error instanceof TokenExpiredException) {

                return   await this.addUpdateEmployeeDocument(params);
            }
            throw error
        }
    }
    async deleteEmployeeDocument(params: DeleteEmployeeDocumentRequest): Promise<EmployeeDocumentDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EmployeeDocumentId: (params.EmployeeDocumentId ?? 0).toString(),
                UniqueKey: params.UniqueKey ?? '',
                EmployeeId: (params.EmployeeId ?? 0).toString(),
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EmployeeMasterApi.DELETE_EMPLOYEE_DOCUMENT}?${queryParams.toString()}`
            )

            return response;

        } catch (error) {

            console.error('ERRPR : DELETE EMPLOYEE DOCUMENT:', error)

            if (error instanceof TokenExpiredException) {

                return   await this.deleteEmployeeDocument(params);
            }

            throw error
        }
    }

}
