import baseClient from '@/core/config/baseClient'
import { EmployeeResignationApi } from '@/features/resignation/api/EmployeeResignationApi'
import type {
    FilterWithPaginationEmployeeResignationRequest,
    DeleteEmployeeResignationRequest,
    EmployeeResignationListResponse,
    EmployeeResignationSaveResponse,
    EmployeeResignationDeleteResponse
} from '@/features/resignation/models/EmployeeResignationModel'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'

export abstract class EmployeeResignationDatasource {
    abstract pullEmployeeResignation(params: FilterWithPaginationEmployeeResignationRequest): Promise<EmployeeResignationListResponse>;
    abstract addUpdateEmployeeResignation(params: FormData): Promise<EmployeeResignationSaveResponse>;
    abstract deleteEmployeeResignation(params: DeleteEmployeeResignationRequest): Promise<EmployeeResignationDeleteResponse>;
}

export class EmployeeResignationDatasourceImpl implements EmployeeResignationDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async pullEmployeeResignation(params: FilterWithPaginationEmployeeResignationRequest): Promise<EmployeeResignationListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.EmployeeResignationId) queryParams.append('EmployeeResignationId', params.EmployeeResignationId.toString());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.ResignationDateFrom) queryParams.append('ResignationDateFrom', params.ResignationDateFrom);
            if (params.ResignationDateTo) queryParams.append('ResignationDateTo', params.ResignationDateTo);
            if (params.Status?.trim()) queryParams.append('Status', params.Status.trim());
            if (params.ApprovalStatus?.trim()) queryParams.append('ApprovalStatus', params.ApprovalStatus.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.IsReport !== undefined) queryParams.append('IsReport', params.IsReport.toString());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${EmployeeResignationApi.PULL}?${queryParams.toString()}`
            )

            return response
        } catch (error) {
            console.error('Error: Pull Employee Resignation:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.pullEmployeeResignation(params);
            }
            throw error
        }
    }

    async addUpdateEmployeeResignation(params: FormData): Promise<EmployeeResignationSaveResponse> {
        try {
            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                EmployeeResignationApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update Employee Resignation:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.addUpdateEmployeeResignation(params);
            }
            throw error
        }
    }

    async deleteEmployeeResignation(params: DeleteEmployeeResignationRequest): Promise<EmployeeResignationDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EmployeeResignationId: params.EmployeeResignationId.toString(),
            })

            if (params.UniqueKey) queryParams.append('UniqueKey', params.UniqueKey);

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${EmployeeResignationApi.DELETE}?${queryParams.toString()}`
            )

            return response
        } catch (error) {
            console.error('Error: Delete Employee Resignation:', error);

            if (error instanceof TokenExpiredException) {

                return  await this.deleteEmployeeResignation(params);
            }
            throw error
        }
    }
}


